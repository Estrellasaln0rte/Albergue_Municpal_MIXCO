// Datos FICTICIOS para probar el panel. Las fechas se calculan desde hoy
// para que el tablero muestre alertas. Bórrenlos antes de usar datos reales.
import { hoyISO, sumarDias } from './esquemas.js'

export function datosDeEjemplo() {
  const h = hoyISO()
  const d = (n) => sumarDias(h, n)
  const animal = (id, nombre, especie, extra) => ({
    id, nombre, especie, publicar: true, procedencia: 'calle', ...extra,
  })

  const animales = [
    animal('canela', 'Canela', 'perro', { sexo: 'hembra', edadAprox: '4 meses', tamano: 'mediano', fechaIngreso: d(-40), estado: 'disponible', color: '#E3A35A', personalidad: ['juguetona', 'cariñosa', 'curiosa'], historia: 'Llegó al albergue junto a sus hermanitos. Le encanta perseguir pelotas.', idealPara: 'Familias con patio y tiempo para jugar.' }),
    animal('pirata', 'Pirata', 'perro', { sexo: 'macho', edadAprox: '3 meses', tamano: 'pequeño', fechaIngreso: d(-40), estado: 'en-proceso', color: '#F4F1EA', manchas: '#3A3330', personalidad: ['valiente', 'tierno'], historia: 'Tiene una mancha en el ojo que le da su nombre.' }),
    animal('michi', 'Michi', 'gato', { sexo: 'macho', edadAprox: '2 años', tamano: 'mediano', fechaIngreso: d(-90), estado: 'disponible', color: '#3A3A40', manchas: '#FFFFFF', personalidad: ['tranquilo', 'ronroneador'], historia: 'Disfruta las siestas al sol.', procedencia: 'entregado' }),
    animal('bruno', 'Bruno', 'perro', { sexo: 'macho', edadAprox: '5 años', tamano: 'grande', fechaIngreso: d(-120), estado: 'disponible', color: '#8A5A3B', personalidad: ['leal', 'calmado'], historia: 'Un adulto noble que ya camina con correa.' }),
    animal('lupe', 'Lupe', 'perro', { sexo: 'hembra', edadAprox: '1 año', tamano: 'mediano', fechaIngreso: d(-5), estado: 'en-tratamiento', color: '#D9C6A5', publicar: false, procedencia: 'maltrato', notas: 'Llegó con sarna; en tratamiento. No publicar hasta que se recupere.' }),
    animal('toby', 'Toby', 'perro', { sexo: 'macho', edadAprox: '1 año', tamano: 'mediano', fechaIngreso: d(-220), estado: 'adoptado', color: '#D9C6A5', personalidad: ['alegre'], historia: 'Toby ya encontró familia.', finalFelizTexto: 'Ahora duerme en un sillón y tiene dos niños que lo pasean cada tarde.' }),
    animal('kiwi', 'Kiwi', 'gato', { sexo: 'hembra', edadAprox: '6 meses', tamano: 'pequeño', fechaIngreso: d(-80), estado: 'adoptado', color: '#E9E4DA', manchas: '#E3A35A', personalidad: ['curiosa'], historia: 'Fue criada con biberón por voluntarias.', finalFelizTexto: 'Ya conquistó la ventana más soleada de la casa.', procedencia: 'nacido' }),
  ]

  const proc = (animalId, fecha, tipo, detalle, proximaFecha) => ({ id: `p-${animalId}-${tipo}-${fecha}`, animalId, fecha, tipo, detalle, responsable: 'Veterinario/a (ejemplo)', proximaFecha })
  const procedimientos = [
    proc('canela', d(-35), 'vacuna', 'Quíntuple, 1.ª dosis', d(-14)),
    proc('canela', d(-14), 'vacuna', 'Quíntuple, 2.ª dosis', d(7)),
    proc('canela', d(-35), 'desparasitacion', 'Interna', d(-5)),
    proc('pirata', d(-35), 'vacuna', 'Quíntuple, 1.ª dosis', d(-2)),
    proc('pirata', d(-35), 'desparasitacion', 'Interna'),
    proc('michi', d(-80), 'vacuna', 'Triple felina', d(285)),
    proc('michi', d(-75), 'esterilizacion', 'Castración'),
    proc('michi', d(-80), 'desparasitacion', 'Interna y externa'),
    proc('bruno', d(-110), 'vacuna', 'Rabia', d(255)),
    proc('bruno', d(-100), 'esterilizacion', 'Castración'),
    proc('bruno', d(-110), 'desparasitacion', 'Interna'),
    proc('lupe', d(-4), 'consulta', 'Diagnóstico de sarna', d(3)),
    proc('lupe', d(-4), 'tratamiento', 'Baños medicados 2 veces por semana'),
    proc('toby', d(-200), 'vacuna', 'Quíntuple'),
    proc('toby', d(-190), 'esterilizacion', 'Castración'),
    proc('kiwi', d(-60), 'vacuna', 'Triple felina'),
    proc('kiwi', d(-50), 'esterilizacion', 'Ovariohisterectomía'),
  ]

  const sol = (id, fecha, nombre, animalId, estado, extra = {}) => ({
    id, fecha, nombre, animalId, estado, dpi: '0000 00000 0000', telefono: '0000-0000', vivienda: 'casa-patio', evaluador: 'Personal del albergue', ...extra,
  })
  const solicitudes = [
    sol('s1', d(-195), 'Familia Ejemplo Uno', 'toby', 'aprobada', { respuestas: 'Casa propia con patio, todos de acuerdo, ya tuvieron perros.' }),
    sol('s2', d(-45), 'Persona Ejemplo Dos', 'kiwi', 'aprobada', { vivienda: 'apartamento' }),
    sol('s3', d(-3), 'Persona Ejemplo Tres', 'pirata', 'en-revision', { respuestas: 'Apartamento alquilado con permiso para mascotas. Trabaja desde casa.' }),
    sol('s4', d(-1), 'Persona Ejemplo Cuatro', 'canela', 'pendiente'),
    sol('s5', d(-20), 'Persona Ejemplo Cinco', 'bruno', 'rechazada', { motivo: 'El animal pasaría más de 10 horas solo en un espacio pequeño. Se le sugirió considerar un gato adulto.' }),
  ]

  const adopciones = [
    { id: 'ad1', animalId: 'toby', solicitudId: 's1', fecha: d(-190), folio: 'EJ-001' },
    { id: 'ad2', animalId: 'kiwi', solicitudId: 's2', fecha: d(-40), folio: 'EJ-002' },
  ]

  const seguimientos = [
    { id: 'sg1', adopcionId: 'ad1', fecha: d(-160), tipo: 'llamada', resultado: 'bien', notas: 'Se adaptó muy bien. Ya está esterilizado.' },
  ]

  return { animales, procedimientos, solicitudes, adopciones, seguimientos }
}
