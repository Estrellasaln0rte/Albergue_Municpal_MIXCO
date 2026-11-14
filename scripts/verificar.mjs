// Revisa los datos de public/datos antes de publicar.
// Uso:  npm run verificar
//  ✗ Error       → algo que rompe la página (hay que corregirlo)
//  ⚠ Pendiente   → dato de ejemplo que todavía hay que cambiar por el real
import fs from 'node:fs'
import path from 'node:path'

const DIR = process.env.DATOS_DIR || 'public/datos'
const errores = []
const avisos = []
const err = (archivo, msg) => errores.push(`${archivo}: ${msg}`)
const pend = (archivo, msg) => avisos.push(`${archivo}: ${msg}`)

// ---------- 1. ¿Los JSON son válidos? ----------
function leer(nombre) {
  const ruta = path.join(DIR, nombre)
  if (!fs.existsSync(ruta)) { err(nombre, 'no existe el archivo'); return null }
  const texto = fs.readFileSync(ruta, 'utf8')
  try {
    return JSON.parse(texto)
  } catch (e) {
    const pos = Number(e.message.match(/position (\d+)/)?.[1])
    const linea = Number.isFinite(pos) ? texto.slice(0, pos).split('\n').length : '?'
    err(nombre, `formato JSON inválido cerca de la línea ${linea}. Revisa comas y comillas. (${e.message})`)
    return null
  }
}
const alb = leer('albergue.json')
const ani = leer('animales.json')
const pub = leer('publicaciones.json')
const cfg = fs.existsSync(path.join(DIR, 'config.json')) ? leer('config.json') : {}

// ---------- 2. Datos de ejemplo que faltan cambiar ----------
const MARCAS = [/PENDIENTE/i, /(?<!por )EJEMPLO/i, /^0000-0000/, /^50200000000$/, /correo@pendiente\.com/, /^000-000000-0$/]
function buscarPendientes(obj, archivo, ruta = '') {
  if (obj == null) return
  if (typeof obj === 'string') {
    if (!ruta.endsWith('_nota') && !ruta.endsWith('_ayuda') && MARCAS.some((m) => m.test(obj))) pend(archivo, `${ruta} = "${obj.length > 70 ? obj.slice(0, 70) + '…' : obj}"`)
  } else if (Array.isArray(obj)) obj.forEach((x, i) => buscarPendientes(x, archivo, `${ruta}[${i}]`))
  else if (typeof obj === 'object') for (const [k, v] of Object.entries(obj)) buscarPendientes(v, archivo, ruta ? `${ruta}.${k}` : k)
}

const FECHA = /^\d{4}-\d{2}-\d{2}$/
const fotoExiste = (f) => !f || /^https?:\/\//.test(f) || fs.existsSync(path.join('public', f))

// ---------- 3. albergue.json ----------
if (alb) {
  buscarPendientes(alb, 'albergue.json')
  for (const k of ['nombre', 'eslogan', 'contacto', 'sede', 'historia', 'adopcion', 'donaciones'])
    if (!alb[k]) err('albergue.json', `falta la sección "${k}"`)
  const wa = String(alb.contacto?.whatsapp ?? '')
  if (!/^502\d{8}$/.test(wa)) err('albergue.json', `contacto.whatsapp debe ser 502 + 8 dígitos, sin espacios ni guiones (ej. 50246302368). Ahora: "${wa}"`)
  for (const r of alb.redes || []) if (!/^https:\/\//.test(r.url || '')) err('albergue.json', `la red "${r.nombre}" necesita un enlace que empiece con https://`)
  if (alb.donaciones?.enlacePago?.activo && !/^https:\/\//.test(alb.donaciones.enlacePago.url || ''))
    err('albergue.json', 'donaciones.enlacePago está activo pero no tiene un enlace https:// válido')
  if (alb.logo?.imagen && !fotoExiste(alb.logo.imagen)) err('albergue.json', `no se encuentra la imagen del logo: public/${alb.logo.imagen}`)
  for (const p of alb.adopcion?.cuestionario?.preguntas || [])
    if (p.tipo === 'opciones' && !(p.opciones?.length > 1)) err('albergue.json', `la pregunta "${p.pregunta}" es de opciones pero tiene menos de 2 opciones`)
}

// ---------- 4. animales.json ----------
const ids = new Set()
if (ani) {
  if (!Array.isArray(ani.animales)) err('animales.json', 'debe tener una lista "animales": [ ... ]')
  for (const [i, a] of (ani.animales || []).entries()) {
    const quien = a.nombre || `animal #${i + 1}`
    if (!a.id) err('animales.json', `${quien}: falta "id"`)
    else if (!/^[a-z0-9-]+$/.test(a.id)) err('animales.json', `${quien}: el id "${a.id}" solo puede tener minúsculas, números y guiones (sin tildes ni espacios)`)
    else if (ids.has(a.id)) err('animales.json', `el id "${a.id}" está repetido`)
    ids.add(a.id)
    if (!a.nombre) err('animales.json', `animal #${i + 1}: falta "nombre"`)
    if (!['perro', 'gato'].includes(a.especie)) err('animales.json', `${quien}: "especie" debe ser perro o gato`)
    if (!['disponible', 'en-proceso', 'adoptado'].includes(a.estado)) err('animales.json', `${quien}: "estado" debe ser disponible, en-proceso o adoptado`)
    if (a.tamano && !['pequeño', 'mediano', 'grande'].includes(a.tamano)) err('animales.json', `${quien}: "tamano" debe ser pequeño, mediano o grande`)
    if (!fotoExiste(a.foto)) err('animales.json', `${quien}: no se encuentra la foto public/${a.foto}`)
    if (a.finalFeliz?.foto && !fotoExiste(a.finalFeliz.foto)) err('animales.json', `${quien}: no se encuentra la foto public/${a.finalFeliz.foto}`)
  }
}

// ---------- 5. publicaciones.json ----------
if (pub) {
  const TIPOS = ['adopcion', 'vacunacion', 'esterilizacion', 'campana', 'aviso']
  for (const a of pub.anuncios || []) {
    if (!TIPOS.includes(a.tipo)) err('publicaciones.json', `aviso "${a.titulo}": tipo debe ser ${TIPOS.join(', ')}`)
    if (!FECHA.test(a.fechaInicio || '') || !FECHA.test(a.fechaFin || '')) err('publicaciones.json', `aviso "${a.titulo}": las fechas deben tener formato AAAA-MM-DD`)
    else if (a.fechaFin < a.fechaInicio) err('publicaciones.json', `aviso "${a.titulo}": fechaFin es anterior a fechaInicio`)
    if (!fotoExiste(a.imagen)) err('publicaciones.json', `aviso "${a.titulo}": no se encuentra public/${a.imagen}`)
    if (/ejemplo/i.test(a.lugar || '')) pend('publicaciones.json', `aviso "${a.titulo}" usa un lugar de ejemplo`)
  }
  for (const x of pub.actividades || []) {
    if (!FECHA.test(x.fecha || '')) err('publicaciones.json', `actividad "${x.titulo}": la fecha debe tener formato AAAA-MM-DD`)
    for (const id of x.animales || []) if (ani && !ids.has(id)) err('publicaciones.json', `actividad "${x.titulo}": no existe un animal con id "${id}"`)
    if (!fotoExiste(x.foto)) err('publicaciones.json', `actividad "${x.titulo}": no se encuentra public/${x.foto}`)
  }
  for (const n of pub.necesidades || [])
    if (n.prioridad && !['alta', 'media', 'baja'].includes(n.prioridad)) err('publicaciones.json', `necesidad "${n.nombre}": prioridad debe ser alta, media o baja`)
}

// ---------- 6. config.json ----------
if (cfg?.supabase?.url && !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(cfg.supabase.url)) err('config.json', 'supabase.url debe verse así: https://xxxx.supabase.co')
if (cfg?.supabase?.url && !cfg.supabase.anonKey) err('config.json', 'falta supabase.anonKey (la clave pública "anon")')
if (/service_role/.test(JSON.stringify(cfg?.supabase || {}))) err('config.json', '¡PELIGRO! Pegaron la clave service_role. Usen SOLO la clave anon.')
for (const [k, url] of Object.entries(cfg?.googleSheets || {}))
  if (url && !/^https:\/\/docs\.google\.com\/spreadsheets\/.+output=csv/.test(url))
    err('config.json', `googleSheets.${k}: debe ser el enlace "Publicar en la web" en formato CSV (termina en output=csv)`)

// ---------- Resultado ----------
console.log('\n🐾 Verificación de datos del albergue\n')
if (avisos.length) {
  console.log(`⚠  ${avisos.length} dato(s) de ejemplo por cambiar:`)
  avisos.forEach((a) => console.log('   · ' + a))
  console.log('')
}
if (errores.length) {
  console.log(`✗  ${errores.length} error(es) que hay que corregir:`)
  errores.forEach((e) => console.log('   · ' + e))
  console.log('')
  process.exit(1)
}
console.log(avisos.length ? '✓  Sin errores. La página funciona, pero aún tiene datos de ejemplo.\n' : '✓  Todo listo para publicar.\n')
