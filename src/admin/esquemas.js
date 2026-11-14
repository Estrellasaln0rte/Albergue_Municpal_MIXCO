// Definición de cada tabla del panel: campos del formulario y columnas de la lista.
// Para agregar un campo nuevo basta con añadirlo aquí.
//
// tipos: texto | area | fecha | numero | opciones | casilla | color | colorOpcional | etiquetas | ref

export const ESTADOS_ANIMAL = {
  'en-tratamiento': 'En tratamiento / cuarentena',
  disponible: 'Disponible para adopción',
  'en-proceso': 'En proceso de adopción',
  adoptado: 'Adoptado',
  transferido: 'Transferido a otra organización',
  fallecido: 'Fallecido',
}
export const ESTADOS_SOLICITUD = {
  pendiente: 'Pendiente',
  'en-revision': 'En revisión',
  aprobada: 'Aprobada',
  rechazada: 'No aprobada',
}

export const ESQUEMAS = {
  animales: {
    titulo: 'Animales',
    singular: 'animal',
    icono: '🐾',
    campos: [
      { k: 'nombre', l: 'Nombre', t: 'texto', req: true },
      { k: 'especie', l: 'Especie', t: 'opciones', op: { perro: 'Perro', gato: 'Gato' }, req: true },
      { k: 'sexo', l: 'Sexo', t: 'opciones', op: { macho: 'Macho', hembra: 'Hembra' } },
      { k: 'edadAprox', l: 'Edad aproximada', t: 'texto', ph: 'Ej. 4 meses, 2 años' },
      { k: 'tamano', l: 'Tamaño', t: 'opciones', op: { 'pequeño': 'Pequeño', mediano: 'Mediano', grande: 'Grande' } },
      { k: 'fechaIngreso', l: 'Fecha de ingreso', t: 'fecha', req: true },
      { k: 'procedencia', l: 'Procedencia', t: 'opciones', op: { calle: 'Rescate en la calle', entregado: 'Entregado por su dueño', reporte: 'Reporte de vecinos', maltrato: 'Caso de maltrato / decomiso', nacido: 'Nació en el albergue', otro: 'Otro' } },
      { k: 'estado', l: 'Estado', t: 'opciones', op: ESTADOS_ANIMAL, req: true },
      { k: 'color', l: 'Color principal (para la ilustración)', t: 'color' },
      { k: 'manchas', l: 'Color de manchas', t: 'colorOpcional' },
      { k: 'publicar', l: 'Mostrar en la página web', t: 'casilla', ayuda: 'Solo se publican los disponibles, en proceso y adoptados.' },
      { k: 'foto', l: 'Foto (nombre del archivo en public/fotos)', t: 'texto', ph: 'fotos/canela.jpg' },
      { k: 'personalidad', l: 'Personalidad', t: 'etiquetas', ph: 'juguetona, cariñosa', publico: true },
      { k: 'historia', l: 'Historia (se ve en la web)', t: 'area', publico: true },
      { k: 'idealPara', l: 'Ideal para (se ve en la web)', t: 'texto', publico: true },
      { k: 'finalFelizTexto', l: 'Final feliz (si ya fue adoptado, se ve en la web)', t: 'area', ayuda: 'Fotos de la familia solo con su permiso.' },
      { k: 'notas', l: 'Notas internas (privadas)', t: 'area' },
    ],
    columnas: ['nombre', 'especie', 'estado', 'fechaIngreso', 'publicar'],
    orden: (a, b) => (b.fechaIngreso || '').localeCompare(a.fechaIngreso || ''),
    nuevo: () => ({ especie: 'perro', estado: 'en-tratamiento', fechaIngreso: hoyISO(), color: '#E3A35A', publicar: false }),
  },

  procedimientos: {
    titulo: 'Procedimientos veterinarios',
    singular: 'procedimiento',
    icono: '🩺',
    campos: [
      { k: 'animalId', l: 'Animal', t: 'ref', ref: 'animales', req: true },
      { k: 'fecha', l: 'Fecha', t: 'fecha', req: true },
      { k: 'tipo', l: 'Tipo', t: 'opciones', req: true, op: { vacuna: 'Vacuna', desparasitacion: 'Desparasitación', esterilizacion: 'Esterilización', consulta: 'Consulta', tratamiento: 'Tratamiento / medicamento', cirugia: 'Cirugía', estetica: 'Baño / estética', otro: 'Otro' } },
      { k: 'detalle', l: 'Detalle', t: 'texto', ph: 'Ej. Vacuna quíntuple, 1.ª dosis' },
      { k: 'responsable', l: 'Responsable / veterinario', t: 'texto' },
      { k: 'costo', l: 'Costo (Q)', t: 'numero' },
      { k: 'proximaFecha', l: 'Próxima dosis / control', t: 'fecha', ayuda: 'El tablero avisará cuando se acerque.' },
      { k: 'notas', l: 'Notas', t: 'area' },
    ],
    columnas: ['fecha', 'animalId', 'tipo', 'detalle', 'proximaFecha'],
    orden: (a, b) => (b.fecha || '').localeCompare(a.fecha || ''),
    nuevo: () => ({ fecha: hoyISO(), tipo: 'vacuna' }),
  },

  solicitudes: {
    titulo: 'Solicitudes de adopción',
    singular: 'solicitud',
    femenino: true,
    icono: '📝',
    privado: true,
    campos: [
      { k: 'fecha', l: 'Fecha de solicitud', t: 'fecha', req: true },
      { k: 'nombre', l: 'Nombre completo', t: 'texto', req: true },
      { k: 'dpi', l: 'DPI', t: 'texto' },
      { k: 'telefono', l: 'Teléfono', t: 'texto' },
      { k: 'correo', l: 'Correo', t: 'texto' },
      { k: 'direccion', l: 'Dirección', t: 'texto' },
      { k: 'animalId', l: 'Animal que le interesa', t: 'ref', ref: 'animales' },
      { k: 'vivienda', l: 'Vivienda', t: 'opciones', op: { 'casa-patio': 'Casa con patio', casa: 'Casa sin patio', apartamento: 'Apartamento' } },
      { k: 'respuestas', l: 'Respuestas del cuestionario / entrevista', t: 'area', ayuda: 'Pueden pegar aquí el mensaje que llegó por WhatsApp.' },
      { k: 'estado', l: 'Estado', t: 'opciones', op: ESTADOS_SOLICITUD, req: true },
      { k: 'evaluador', l: 'Evaluado por', t: 'texto' },
      { k: 'motivo', l: 'Motivo de la decisión', t: 'area' },
    ],
    columnas: ['fecha', 'nombre', 'animalId', 'estado'],
    orden: (a, b) => (b.fecha || '').localeCompare(a.fecha || ''),
    nuevo: () => ({ fecha: hoyISO(), estado: 'pendiente' }),
  },

  adopciones: {
    titulo: 'Adopciones',
    singular: 'adopción',
    femenino: true,
    icono: '🏡',
    privado: true,
    campos: [
      { k: 'animalId', l: 'Animal adoptado', t: 'ref', ref: 'animales', req: true },
      { k: 'solicitudId', l: 'Adoptante (solicitud aprobada)', t: 'ref', ref: 'solicitudes', req: true },
      { k: 'fecha', l: 'Fecha de adopción', t: 'fecha', req: true },
      { k: 'folio', l: 'No. de contrato / folio', t: 'texto' },
      { k: 'notas', l: 'Notas', t: 'area' },
    ],
    columnas: ['fecha', 'animalId', 'solicitudId', 'folio'],
    orden: (a, b) => (b.fecha || '').localeCompare(a.fecha || ''),
    nuevo: () => ({ fecha: hoyISO() }),
    ayuda: 'Al guardar una adopción, el animal pasa a "Adoptado" y la solicitud a "Aprobada" automáticamente.',
  },

  seguimientos: {
    titulo: 'Seguimientos post-adopción',
    singular: 'seguimiento',
    icono: '📞',
    privado: true,
    campos: [
      { k: 'adopcionId', l: 'Adopción', t: 'ref', ref: 'adopciones', req: true },
      { k: 'fecha', l: 'Fecha', t: 'fecha', req: true },
      { k: 'tipo', l: 'Tipo', t: 'opciones', op: { llamada: 'Llamada', visita: 'Visita', mensaje: 'Mensaje', foto: 'Recibimos foto/video' } },
      { k: 'resultado', l: 'Resultado', t: 'opciones', op: { bien: '😊 Todo bien', observaciones: '😐 Con observaciones', preocupante: '😟 Preocupante' } },
      { k: 'notas', l: 'Notas', t: 'area' },
    ],
    columnas: ['fecha', 'adopcionId', 'tipo', 'resultado'],
    orden: (a, b) => (b.fecha || '').localeCompare(a.fecha || ''),
    nuevo: () => ({ fecha: hoyISO(), tipo: 'llamada', resultado: 'bien' }),
  },
}

export function hoyISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const sumarDias = (iso, dias) => {
  const [a, m, d] = iso.split('-').map(Number)
  return hoyISO(new Date(a, m - 1, d + dias))
}

export const fechaBonita = (iso) => {
  if (!iso) return '—'
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d).toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Texto para mostrar un registro referenciado (ej. el nombre del animal)
export function etiquetaDe(tabla, id, db) {
  const r = (db[tabla] || []).find((x) => x.id === id)
  if (!r) return id ? '(eliminado)' : '—'
  if (tabla === 'adopciones') {
    return `${etiquetaDe('animales', r.animalId, db)} → ${etiquetaDe('solicitudes', r.solicitudId, db)}`
  }
  return r.nombre || r.id
}

// Valor de un campo listo para mostrar en tablas y CSV
export function mostrar(campo, valor, db) {
  if (valor === undefined || valor === null || valor === '') return campo.t === 'casilla' ? 'No' : ''
  switch (campo.t) {
    case 'opciones': return campo.op[valor] || valor
    case 'casilla': return valor ? 'Sí' : 'No'
    case 'fecha': return fechaBonita(valor)
    case 'ref': return etiquetaDe(campo.ref, valor, db)
    case 'etiquetas': return Array.isArray(valor) ? valor.join(', ') : valor
    default: return String(valor)
  }
}
