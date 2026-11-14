// Utilidades compartidas
import { leerHoja } from './hojas.js'

// Carga los JSON de /public/datos en tiempo de ejecución.
// Así el albergue puede editar los datos SIN volver a compilar el sitio.
// Si config.json tiene enlaces de Google Sheets, esas listas se leen de la hoja
// (y si la hoja falla, se usa el JSON como respaldo).
export async function cargarDatos() {
  const base = import.meta.env.BASE_URL
  const leer = async (archivo) => {
    const r = await fetch(`${base}datos/${archivo}?v=${Date.now()}`)
    if (!r.ok) throw new Error(`No se pudo leer ${archivo}`)
    return r.json()
  }
  const [albergue, animales, publicaciones, config] = await Promise.all([
    leer('albergue.json'),
    leer('animales.json'),
    leer('publicaciones.json'),
    leer('config.json').catch(() => ({})),
  ])
  const datos = { albergue, animales: animales.animales, necesidades: [], ...publicaciones }

  // Fase 2 (opcional): leer los animales directo de la base de datos Supabase
  const sb = config.supabase || {}
  if (sb.url?.trim() && sb.anonKey?.trim()) {
    try {
      const r = await fetch(`${sb.url.trim().replace(/\/$/, '')}/rest/v1/animales_publicos?select=*`, {
        headers: { apikey: sb.anonKey.trim(), Authorization: `Bearer ${sb.anonKey.trim()}` },
      })
      if (!r.ok) throw new Error(`Supabase respondió ${r.status}`)
      datos.animales = (await r.json()).map((a) => ({ ...a, manchas: a.manchas || undefined, finalFeliz: a.finalFeliz || undefined }))
      config.googleSheets = { ...config.googleSheets, animales: '' }
    } catch (e) {
      console.warn(`No se pudo leer Supabase (${e.message}); se usan los otros datos.`)
    }
  }

  const hojas = config.googleSheets || {}
  await Promise.all(
    ['animales', 'anuncios', 'actividades', 'necesidades']
      .filter((k) => hojas[k]?.trim())
      .map(async (k) => {
        try {
          datos[k] = await leerHoja(k, hojas[k].trim())
        } catch (e) {
          console.warn(`${e.message}; se usan los datos del JSON.`)
        }
      })
  )
  return datos
}

// Convierte "2026-11-18" en fecha local (sin desfase de zona horaria)
export const aFecha = (s) => {
  const [a, m, d] = s.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export const fechaLarga = (s) =>
  aFecha(s).toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })

export const fechaCorta = (s) =>
  aFecha(s).toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' })

export const mesCorto = (s) =>
  aFecha(s).toLocaleDateString('es-GT', { month: 'short' }).replace('.', '')

export const hoy = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// Enlace de WhatsApp con mensaje prellenado
export const linkWhatsapp = (numero, mensaje) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`

// Ruta de foto relativa a public/
export const rutaFoto = (foto) => (foto ? `${import.meta.env.BASE_URL}${foto}` : '')
