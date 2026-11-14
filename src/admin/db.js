// Base de datos local del panel de gestión (IndexedDB del navegador).
// Los datos se guardan SOLO en esta computadora y este navegador.
// No viajan a internet. Por eso es importante descargar respaldos.

const NOMBRE = 'albergue-mixco-gestion'
const VERSION = 1
export const TABLAS = ['animales', 'procedimientos', 'solicitudes', 'adopciones', 'seguimientos']

let conexion
function abrir() {
  if (conexion) return conexion
  conexion = new Promise((ok, mal) => {
    const req = indexedDB.open(NOMBRE, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      for (const t of TABLAS) if (!db.objectStoreNames.contains(t)) db.createObjectStore(t, { keyPath: 'id' })
    }
    req.onsuccess = () => ok(req.result)
    req.onerror = () => mal(req.error)
  })
  return conexion
}

const tx = async (tablas, modo, fn) => {
  const db = await abrir()
  return new Promise((ok, mal) => {
    const t = db.transaction(tablas, modo)
    const res = fn(t)
    t.oncomplete = () => ok(res?.result ?? res)
    t.onerror = () => mal(t.error)
    t.onabort = () => mal(t.error)
  })
}

export const todos = (tabla) => tx([tabla], 'readonly', (t) => t.objectStore(tabla).getAll())

export async function todo() {
  const res = {}
  for (const t of TABLAS) res[t] = await todos(t)
  return res
}

export const guardar = (tabla, registro) => {
  const ahora = new Date().toISOString()
  const r = { creado: ahora, ...registro, id: registro.id || nuevoId(), actualizado: ahora }
  return tx([tabla], 'readwrite', (t) => { t.objectStore(tabla).put(r) }).then(() => r)
}

export const borrar = (tabla, id) => tx([tabla], 'readwrite', (t) => { t.objectStore(tabla).delete(id) })

// Reemplaza TODO el contenido (para restaurar un respaldo)
export const reemplazarTodo = (datos) =>
  tx(TABLAS, 'readwrite', (t) => {
    for (const nombre of TABLAS) {
      const s = t.objectStore(nombre)
      s.clear()
      for (const r of datos[nombre] || []) s.put(r)
    }
  })

export const nuevoId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`)

// Id legible para animales (se usa en el enlace público: #/peludito/canela)
export function idDeNombre(nombre, existentes) {
  const base = (nombre || 'animal').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'animal'
  let id = base, n = 2
  while (existentes.includes(id)) id = `${base}-${n++}`
  return id
}

// Pide al navegador que no borre estos datos aunque falte espacio
export async function pedirPersistencia() {
  try {
    if (!navigator.storage?.persist) return null
    return (await navigator.storage.persisted()) || (await navigator.storage.persist())
  } catch {
    return null
  }
}

// Fecha del último respaldo (preferencia de este navegador)
export const ultimoRespaldo = {
  leer: () => { try { return localStorage.getItem('albergue-ultimo-respaldo') } catch { return null } },
  marcar: () => { try { localStorage.setItem('albergue-ultimo-respaldo', new Date().toISOString()) } catch { /* sin almacenamiento */ } },
}
