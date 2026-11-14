// Conversión entre filas de hoja de cálculo (Google Sheets / Excel / CSV)
// y los objetos que usa la página. Lo usan:
//   - la página pública, cuando config.json apunta a Google Sheets
//   - el panel de gestión, para exportar CSV
//   - scripts/plantillas.mjs, para generar las plantillas vacías

// ---------- CSV ----------
export function parseCSV(texto) {
  const filas = []
  let fila = [], campo = '', comillas = false
  texto = texto.replace(/^﻿/, '')
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++ }
      else if (c === '"') comillas = false
      else campo += c
    } else if (c === '"') comillas = true
    else if (c === ',') { fila.push(campo); campo = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++
      fila.push(campo); filas.push(fila); fila = []; campo = ''
    } else campo += c
  }
  if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila) }
  const [cab = [], ...resto] = filas.filter((f) => f.some((x) => x.trim() !== ''))
  const claves = cab.map((h) => h.trim())
  return resto.map((f) => Object.fromEntries(claves.map((k, i) => [k, (f[i] ?? '').trim()])))
}

const celda = (v) => {
  const s = v == null ? '' : String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
export const aCSV = (columnas, filas) =>
  '﻿' + [columnas.join(','), ...filas.map((f) => columnas.map((c) => celda(f[c])).join(','))].join('\r\n')

// ---------- Ayudantes ----------
const SI = ['si', 'sí', 'x', 'true', '1', 'verdadero', 'yes']
export const aBool = (v) => SI.includes(String(v ?? '').trim().toLowerCase())
const aLista = (v) => String(v ?? '').split(',').map((x) => x.trim()).filter(Boolean)
const siNo = (b) => (b ? 'sí' : 'no')

// Acepta 2026-11-18, 18/11/2026 o 18-11-2026 y devuelve 2026-11-18
export function aFechaISO(v) {
  const s = String(v ?? '').trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : s
}

// ---------- Definición de cada hoja ----------
export const HOJAS = {
  animales: {
    columnas: ['id', 'nombre', 'especie', 'sexo', 'edad', 'tamano', 'estado', 'color', 'manchas', 'foto', 'personalidad',
      'vacunas', 'desparasitado', 'esterilizado', 'historia', 'idealPara', 'finalFelizFecha', 'finalFelizTexto', 'finalFelizFoto'],
    deFila: (f) => ({
      id: f.id || f.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-'),
      nombre: f.nombre,
      especie: (f.especie || 'perro').toLowerCase(),
      sexo: (f.sexo || '').toLowerCase(),
      edad: f.edad,
      tamano: (f.tamano || '').toLowerCase(),
      estado: (f.estado || 'disponible').toLowerCase(),
      color: f.color || '#E3A35A',
      manchas: f.manchas || undefined,
      foto: f.foto,
      personalidad: aLista(f.personalidad),
      salud: { vacunas: aBool(f.vacunas), desparasitado: aBool(f.desparasitado), esterilizado: aBool(f.esterilizado) },
      historia: f.historia,
      idealPara: f.idealPara,
      finalFeliz: f.finalFelizTexto ? { fecha: aFechaISO(f.finalFelizFecha), texto: f.finalFelizTexto, foto: f.finalFelizFoto } : undefined,
    }),
    aFila: (a) => ({
      ...a,
      manchas: a.manchas || '',
      personalidad: (a.personalidad || []).join(', '),
      vacunas: siNo(a.salud?.vacunas),
      desparasitado: siNo(a.salud?.desparasitado),
      esterilizado: siNo(a.salud?.esterilizado),
      finalFelizFecha: a.finalFeliz?.fecha || '',
      finalFelizTexto: a.finalFeliz?.texto || '',
      finalFelizFoto: a.finalFeliz?.foto || '',
    }),
  },
  anuncios: {
    columnas: ['id', 'tipo', 'titulo', 'fechaInicio', 'fechaFin', 'horario', 'lugar', 'descripcion', 'imagen', 'destacado'],
    deFila: (f, i) => ({
      ...f,
      id: f.id || `aviso-${i + 1}`,
      tipo: (f.tipo || 'aviso').toLowerCase(),
      fechaInicio: aFechaISO(f.fechaInicio),
      fechaFin: aFechaISO(f.fechaFin || f.fechaInicio),
      destacado: aBool(f.destacado),
    }),
    aFila: (a) => ({ ...a, destacado: siNo(a.destacado) }),
  },
  actividades: {
    columnas: ['id', 'fecha', 'titulo', 'texto', 'animales', 'foto', 'emoji'],
    deFila: (f, i) => ({ ...f, id: f.id || `act-${i + 1}`, fecha: aFechaISO(f.fecha), animales: aLista(f.animales) }),
    aFila: (a) => ({ ...a, animales: (a.animales || []).join(', ') }),
  },
  necesidades: {
    columnas: ['nombre', 'prioridad', 'detalle'],
    deFila: (f) => ({ ...f, prioridad: (f.prioridad || 'media').toLowerCase() }),
    aFila: (a) => a,
  },
}

// Descarga una hoja publicada de Google Sheets (Archivo > Compartir > Publicar en la web > CSV)
export async function leerHoja(nombre, url) {
  const r = await fetch(url, { cache: 'no-store' })
  if (!r.ok) throw new Error(`No se pudo leer la hoja ${nombre}`)
  return parseCSV(await r.text())
    .filter((f) => Object.values(f).some(Boolean))
    .map((f, i) => HOJAS[nombre].deFila(f, i))
}
