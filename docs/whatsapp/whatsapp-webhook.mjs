// =====================================================================
//  PROPUESTA — Conectar el WhatsApp del albergue con la base de datos
//  (Nivel 3 de docs/README_TECNICO.md → "WhatsApp")
//
//  Qué hace:
//   1. Meta (WhatsApp Cloud API) avisa a esta función cada vez que llega un mensaje.
//   2. La función guarda el mensaje en la tabla  mensajes_whatsapp  de Supabase.
//   3. Si el mensaje es una solicitud de adopción (el texto que arma la página:
//      "Soy … y quiero iniciar un proceso de adopción para …"), crea una
//      solicitud "pendiente" con el nombre, el teléfono y el animal.
//   4. (Opcional) Responde automáticamente con un mensaje de confirmación.
//
//  Dónde vive: es una Netlify Function. Para activarla, copiar este archivo a
//    netlify/functions/whatsapp.mjs
//  y configurar las variables de entorno en Netlify (Site settings → Environment variables):
//    WA_VERIFY_TOKEN        texto secreto inventado por ustedes (el mismo que ponen en Meta)
//    WA_APP_SECRET          "App secret" de la app de Meta (para validar la firma)
//    WA_ACCESS_TOKEN        token de acceso permanente (solo si usan la respuesta automática)
//    WA_PHONE_NUMBER_ID     id del número en Meta (solo si usan la respuesta automática)
//    SUPABASE_URL           https://xxxx.supabase.co
//    SUPABASE_SERVICE_KEY   clave service_role (SOLO aquí, nunca en la página ni en config.json)
//
//  URL que se registra en Meta como webhook:  https://SU-SITIO.netlify.app/api/whatsapp
//
//  ⚠ Requiere acuerdo formal con la Municipalidad (guarda datos personales).
//  ⚠ La API de Meta cambia con el tiempo: revisen la versión vigente en
//    https://developers.facebook.com/docs/whatsapp/cloud-api
// =====================================================================
import crypto from 'node:crypto'

export const config = { path: '/api/whatsapp' }

const env = (k) => process.env[k] || ''
const GRAPH_VERSION = 'v21.0' // actualizar si Meta publica una versión nueva

export default async function handler(req) {
  const url = new URL(req.url)

  // 1) Verificación inicial del webhook (Meta la hace una sola vez al registrarlo)
  if (req.method === 'GET') {
    const ok = url.searchParams.get('hub.mode') === 'subscribe' && url.searchParams.get('hub.verify_token') === env('WA_VERIFY_TOKEN')
    return ok ? new Response(url.searchParams.get('hub.challenge')) : new Response('Token inválido', { status: 403 })
  }
  if (req.method !== 'POST') return new Response('Método no permitido', { status: 405 })

  // 2) Validar que el aviso realmente viene de Meta (firma HMAC-SHA256)
  const cuerpo = await req.text()
  const firma = req.headers.get('x-hub-signature-256') || ''
  const esperada = 'sha256=' + crypto.createHmac('sha256', env('WA_APP_SECRET')).update(cuerpo).digest('hex')
  if (firma.length !== esperada.length || !crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada))) {
    return new Response('Firma inválida', { status: 401 })
  }

  // 3) Procesar los mensajes de texto que llegaron
  const datos = JSON.parse(cuerpo)
  for (const entrada of datos.entry || []) {
    for (const cambio of entrada.changes || []) {
      const valor = cambio.value || {}
      const nombres = Object.fromEntries((valor.contacts || []).map((c) => [c.wa_id, c.profile?.name]))
      for (const m of valor.messages || []) {
        if (m.type !== 'text') continue
        try {
          await procesarMensaje({ id: m.id, wa_id: m.from, nombre_perfil: nombres[m.from] || null, texto: m.text?.body || '' })
        } catch (e) {
          console.error('Error al procesar mensaje', m.id, e.message)
        }
      }
    }
  }
  // Meta reintenta si no recibe 200 rápido: siempre responder 200
  return new Response('ok')
}

// ---------------------------------------------------------------------
async function procesarMensaje(msg) {
  // Guardar el mensaje (si Meta lo reenvía, el id repetido se ignora)
  await supabase('mensajes_whatsapp', 'POST', msg, 'resolution=ignore-duplicates,return=minimal')

  const solicitud = leerSolicitud(msg.texto)
  if (!solicitud) return

  // Buscar el animal por nombre (sin distinguir mayúsculas)
  let animalId = null
  if (solicitud.animal) {
    const encontrados = await supabase(`animales?select=id&nombre=ilike.${encodeURIComponent(solicitud.animal)}&limit=1`, 'GET')
    animalId = encontrados?.[0]?.id || null
  }

  const [nueva] = await supabase('solicitudes', 'POST', {
    nombre: solicitud.nombre || msg.nombre_perfil || 'Sin nombre',
    telefono: msg.wa_id,
    animal_id: animalId,
    vivienda: solicitud.vivienda,
    respuestas: solicitud.respuestas + (solicitud.animal && !animalId ? `\n\n(Pidió a "${solicitud.animal}", no encontrado en la base)` : ''),
    estado: 'pendiente',
    evaluador: null,
  }, 'return=representation')

  await supabase(`mensajes_whatsapp?id=eq.${encodeURIComponent(msg.id)}`, 'PATCH', { procesado: true, solicitud_id: nueva.id }, 'return=minimal')

  // (Opcional) respuesta automática
  if (env('WA_ACCESS_TOKEN') && env('WA_PHONE_NUMBER_ID')) {
    await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${env('WA_PHONE_NUMBER_ID')}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env('WA_ACCESS_TOKEN')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: msg.wa_id,
        type: 'text',
        text: { body: '¡Gracias por tu interés en adoptar! 🐾 Recibimos tu solicitud y una persona del albergue te escribirá pronto.' },
      }),
    })
  }
}

// Reconoce el mensaje que arma la página web (mismo formato que el panel)
function leerSolicitud(texto) {
  const nombre = texto.match(/soy\s+(.+?)\s+y\s+quiero/i)?.[1]?.trim()
  const animal = (texto.match(/adopci[oó]n\s+para\s+([^.\n]+)/i) || texto.match(/vi\s+a\s+(.+?)\s+en\s+la\s+p[aá]gina/i))?.[1]?.trim()
  if (!nombre && !animal) return null // no es una solicitud: queda solo como mensaje
  const lineas = texto.split('\n').map((l) => l.trim()).filter((l) => /^[•\-*]/.test(l)).map((l) => l.replace(/^[•\-*]\s*/, ''))
  const viv = (lineas.find((l) => /d[oó]nde vives\?/i.test(l)) || '').split('?').slice(1).join('?').trim().toLowerCase()
  const vivienda = { 'casa con patio': 'casa-patio', 'casa sin patio': 'casa', apartamento: 'apartamento' }[viv] || null
  return { nombre, animal, vivienda, respuestas: lineas.length ? lineas.join('\n') : texto }
}

// Llamada a la API REST de Supabase con la clave de servicio (solo en el servidor)
async function supabase(ruta, metodo, cuerpo, prefer) {
  const r = await fetch(`${env('SUPABASE_URL')}/rest/v1/${ruta}`, {
    method: metodo,
    headers: {
      apikey: env('SUPABASE_SERVICE_KEY'),
      Authorization: `Bearer ${env('SUPABASE_SERVICE_KEY')}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  })
  if (!r.ok) throw new Error(`Supabase ${metodo} ${ruta}: ${r.status} ${await r.text()}`)
  return r.status === 204 || prefer?.includes('return=minimal') ? null : r.json()
}
