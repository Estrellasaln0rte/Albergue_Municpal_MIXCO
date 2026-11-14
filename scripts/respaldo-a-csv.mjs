// Convierte un respaldo del Panel de gestión (respaldo-albergue-AAAA-MM-DD.json)
// en archivos CSV listos para importar en Supabase (Table editor → Import data from CSV),
// con los mismos nombres de columna que docs/base-de-datos/esquema.sql.
//
// Uso:  npm run respaldo-a-csv -- ruta/al/respaldo.json
// Crea la carpeta  migracion-supabase/  con un CSV por tabla.
// ⚠ Los CSV contienen datos personales: bórrenlos después de importarlos.
import fs from 'node:fs'
import { aCSV } from '../src/hojas.js'

const archivo = process.argv[2]
if (!archivo) {
  console.log('Uso: npm run respaldo-a-csv -- ruta/al/respaldo.json')
  process.exit(1)
}
const respaldo = JSON.parse(fs.readFileSync(archivo, 'utf8'))
if (respaldo.app !== 'albergue-mixco-gestion') {
  console.log('✗ Ese archivo no es un respaldo del Panel de gestión.')
  process.exit(1)
}

// campo del panel → columna de la base de datos
const COLUMNAS = {
  animales: { id: 'id', nombre: 'nombre', especie: 'especie', sexo: 'sexo', edadAprox: 'edad_aprox', tamano: 'tamano', fechaIngreso: 'fecha_ingreso', procedencia: 'procedencia', estado: 'estado', color: 'color', manchas: 'manchas', publicar: 'publicar', foto: 'foto', personalidad: 'personalidad', historia: 'historia', idealPara: 'ideal_para', finalFelizTexto: 'final_feliz_texto', notas: 'notas', creado: 'creado', actualizado: 'actualizado' },
  procedimientos: { id: 'id', animalId: 'animal_id', fecha: 'fecha', tipo: 'tipo', detalle: 'detalle', responsable: 'responsable', costo: 'costo', proximaFecha: 'proxima_fecha', notas: 'notas', creado: 'creado', actualizado: 'actualizado' },
  solicitudes: { id: 'id', fecha: 'fecha', nombre: 'nombre', dpi: 'dpi', telefono: 'telefono', correo: 'correo', direccion: 'direccion', animalId: 'animal_id', vivienda: 'vivienda', respuestas: 'respuestas', estado: 'estado', evaluador: 'evaluador', motivo: 'motivo', creado: 'creado', actualizado: 'actualizado' },
  adopciones: { id: 'id', animalId: 'animal_id', solicitudId: 'solicitud_id', fecha: 'fecha', folio: 'folio', notas: 'notas', creado: 'creado', actualizado: 'actualizado' },
  seguimientos: { id: 'id', adopcionId: 'adopcion_id', fecha: 'fecha', tipo: 'tipo', resultado: 'resultado', notas: 'notas', creado: 'creado', actualizado: 'actualizado' },
}

// Columnas obligatorias que el panel puede dejar vacías
const POR_DEFECTO = { personalidad: [], publicar: false }

const valor = (v) => {
  if (v === undefined || v === null) return ''
  if (Array.isArray(v)) return `{${v.map((x) => `"${String(x).replace(/"/g, '\\"')}"`).join(',')}}` // arreglo de Postgres
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  return v
}

fs.mkdirSync('migracion-supabase', { recursive: true })
// El orden importa: primero animales, al final seguimientos (por las referencias)
for (const [tabla, mapa] of Object.entries(COLUMNAS)) {
  // Registros sin fecha de creación (p. ej. datos de ejemplo) toman la fecha del respaldo
  const fechaRespaldo = respaldo.fecha || new Date().toISOString()
  const filas = (respaldo.datos[tabla] || []).map((r) =>
    Object.fromEntries(Object.entries(mapa).map(([campo, col]) => [
      col,
      valor(['creado', 'actualizado'].includes(campo) ? r[campo] || fechaRespaldo : r[campo] ?? POR_DEFECTO[campo]),
    ]))
  )
  fs.writeFileSync(`migracion-supabase/${tabla}.csv`, aCSV(Object.values(mapa), filas).replace(/^﻿/, ''))
  console.log(`✓ migracion-supabase/${tabla}.csv  (${filas.length} filas)`)
}
console.log('\nImporten en este orden: animales, procedimientos, solicitudes, adopciones, seguimientos.')
console.log('⚠ Contienen datos personales: borren la carpeta migracion-supabase/ al terminar.\n')
