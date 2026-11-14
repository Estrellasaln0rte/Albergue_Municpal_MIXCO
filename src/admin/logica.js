// Cálculos del tablero y exportaciones del panel
import { ESQUEMAS, hoyISO, sumarDias, mostrar } from './esquemas.js'
import { HOJAS, aCSV } from '../hojas.js'

export const EN_ALBERGUE = ['en-tratamiento', 'disponible', 'en-proceso']

// Vacunas / desparasitaciones / controles que vencen pronto (animales que siguen en el albergue)
export function proximosProcedimientos(db, dias = 14) {
  const limite = sumarDias(hoyISO(), dias)
  const enAlbergue = new Set(db.animales.filter((a) => EN_ALBERGUE.includes(a.estado)).map((a) => a.id))
  const ultimo = {}
  for (const p of db.procedimientos) {
    if (!enAlbergue.has(p.animalId)) continue
    const k = `${p.animalId}|${p.tipo}`
    if (!ultimo[k] || p.fecha > ultimo[k].fecha) ultimo[k] = p
  }
  return Object.values(ultimo)
    .filter((p) => p.proximaFecha && p.proximaFecha <= limite)
    .map((p) => ({ ...p, vencido: p.proximaFecha < hoyISO() }))
    .sort((a, b) => a.proximaFecha.localeCompare(b.proximaFecha))
}

// Seguimientos recomendados: al mes y a los 6 meses de la adopción
export function seguimientosPendientes(db) {
  const hoy = hoyISO()
  const res = []
  for (const ad of db.adopciones) {
    const hechos = db.seguimientos.filter((s) => s.adopcionId === ad.id).length
    if (sumarDias(ad.fecha, 180) <= hoy && hechos < 2) res.push({ adopcion: ad, hito: '6 meses', desde: sumarDias(ad.fecha, 180) })
    else if (sumarDias(ad.fecha, 30) <= hoy && hechos < 1) res.push({ adopcion: ad, hito: '1 mes', desde: sumarDias(ad.fecha, 30) })
  }
  return res.sort((a, b) => a.desde.localeCompare(b.desde))
}

export function adopcionesPorMes(db, meses = 6) {
  const d = new Date()
  const res = []
  for (let i = meses - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1)
    const clave = hoyISO(m).slice(0, 7)
    res.push({
      clave,
      etiqueta: m.toLocaleDateString('es-GT', { month: 'short' }).replace('.', ''),
      total: db.adopciones.filter((a) => (a.fecha || '').startsWith(clave)).length,
    })
  }
  return res
}

// ---------- Publicar en la web ----------
const ESTADOS_PUBLICOS = ['disponible', 'en-proceso', 'adoptado']
const huboProc = (db, animalId, tipo) => db.procedimientos.some((p) => p.animalId === animalId && p.tipo === tipo)

// Convierte los expedientes en la lista pública (SIN datos privados).
// La salud se calcula a partir de los procedimientos registrados.
export function animalesPublicos(db) {
  return db.animales
    .filter((a) => a.publicar && ESTADOS_PUBLICOS.includes(a.estado))
    .map((a) => {
      const adopcion = db.adopciones.find((x) => x.animalId === a.id)
      const pub = {
        id: a.id,
        nombre: a.nombre,
        especie: a.especie,
        sexo: a.sexo || '',
        edad: a.edadAprox || '',
        tamano: a.tamano || '',
        estado: a.estado,
        color: a.color || '#E3A35A',
        manchas: a.manchas || undefined,
        foto: a.foto || '',
        personalidad: (a.personalidad || []).filter(Boolean),
        salud: {
          vacunas: huboProc(db, a.id, 'vacuna'),
          desparasitado: huboProc(db, a.id, 'desparasitacion'),
          esterilizado: huboProc(db, a.id, 'esterilizacion'),
        },
        historia: a.historia || '',
        idealPara: a.idealPara || '',
      }
      if (a.estado === 'adoptado' && a.finalFelizTexto) {
        pub.finalFeliz = { fecha: adopcion?.fecha || '', texto: a.finalFelizTexto, foto: '' }
      }
      return pub
    })
}

export const jsonPublico = (db) =>
  JSON.stringify(
    {
      _nota: `Generado desde el Panel de gestión el ${new Date().toLocaleString('es-GT')}. Reemplaza public/datos/animales.json (o dist/datos/animales.json en el sitio publicado).`,
      animales: animalesPublicos(db),
    },
    null,
    2
  )

export const csvPublico = (db) => aCSV(HOJAS.animales.columnas, animalesPublicos(db).map(HOJAS.animales.aFila))

// CSV legible en Excel de una tabla interna (con nombres en lugar de códigos)
export function csvTabla(tabla, db) {
  const esq = ESQUEMAS[tabla]
  const cols = esq.campos.map((c) => c.l)
  const filas = [...db[tabla]].sort(esq.orden).map((r) => Object.fromEntries(esq.campos.map((c) => [c.l, mostrar(c, r[c.k], db)])))
  return aCSV(cols, filas)
}

export function descargar(nombre, contenido, tipo = 'text/plain') {
  const url = URL.createObjectURL(new Blob([contenido], { type: `${tipo};charset=utf-8` }))
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ---------- Importar una solicitud desde un mensaje de WhatsApp ----------
// Reconoce los mensajes que arma la página (cuestionario o botón "Quiero adoptar a ...")
const VIVIENDA = { 'casa con patio': 'casa-patio', 'casa sin patio': 'casa', apartamento: 'apartamento' }
const norm = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

export function leerMensajeWhatsapp(texto, animales = []) {
  // Quita la marca de hora que agrega WhatsApp al copiar: "[13/11/26, 10:15] Nombre: "
  const limpio = texto.replace(/^\[[^\]]+\]\s*[^:\n]+:\s*/gm, '').trim()
  const nombre = limpio.match(/soy\s+(.+?)\s+y\s+quiero/i)?.[1]?.trim() || ''
  const nombreAnimal = (limpio.match(/adopci[oó]n\s+para\s+([^.\n]+)/i) || limpio.match(/vi\s+a\s+(.+?)\s+en\s+la\s+p[aá]gina/i))?.[1]?.trim()
  const animal = nombreAnimal ? animales.find((a) => norm(a.nombre) === norm(nombreAnimal)) : null
  const lineas = limpio.split('\n').map((l) => l.trim()).filter((l) => /^[•\-*]/.test(l)).map((l) => l.replace(/^[•\-*]\s*/, ''))
  const vivRespuesta = lineas.find((l) => /d[oó]nde vives\?/i.test(l))?.split('?').slice(1).join('?').trim()
  return {
    nombre,
    animalId: animal?.id || '',
    animalNoEncontrado: nombreAnimal && !animal ? nombreAnimal : '',
    vivienda: VIVIENDA[norm(vivRespuesta)] || '',
    respuestas: lineas.length ? lineas.join('\n') : limpio,
  }
}
