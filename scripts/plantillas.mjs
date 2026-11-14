// Genera las plantillas CSV (para importar en Google Sheets o Excel)
// a partir de los JSON actuales de public/datos.
// Uso:  npm run plantillas
import fs from 'node:fs'
import { HOJAS, aCSV } from '../src/hojas.js'

const leer = (f) => JSON.parse(fs.readFileSync(`public/datos/${f}`, 'utf8'))
const fuentes = {
  animales: leer('animales.json').animales,
  anuncios: leer('publicaciones.json').anuncios,
  actividades: leer('publicaciones.json').actividades,
  necesidades: leer('publicaciones.json').necesidades || [],
}
fs.mkdirSync('plantillas/google-sheets', { recursive: true })
for (const [nombre, filas] of Object.entries(fuentes)) {
  const h = HOJAS[nombre]
  fs.writeFileSync(`plantillas/google-sheets/${nombre}.csv`, aCSV(h.columnas, filas.map(h.aFila)))
  console.log(`plantillas/google-sheets/${nombre}.csv  (${filas.length} filas de ejemplo)`)
}
