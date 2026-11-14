import { useState } from 'react'
import { Ola, Gato } from './Ilustraciones.jsx'
import { linkWhatsapp } from '../utils.js'

const ICONOS_RED = { facebook: 'f', instagram: '◎', tiktok: '♪', youtube: '▶', x: '𝕏', whatsapp: '💬' }
// Número local de 8 dígitos (acepta "4630-2368", "+502 4630 2368", etc.)
const soloDigitos = (t = '') => {
  const d = t.replace(/\D/g, '')
  return d.length === 11 && d.startsWith('502') ? d.slice(3) : d.slice(0, 8)
}

const MOTIVOS = ['Quiero adoptar', 'Quiero donar', 'Quiero ser voluntario/a', 'Reportar un animal en riesgo', 'Otro']

// El formulario NO guarda ni envía datos a ningún servidor:
// solo arma un mensaje y abre WhatsApp o el correo de la persona.
export default function Contacto({ albergue }) {
  const { contacto, redes } = albergue
  const [f, setF] = useState({ nombre: '', motivo: MOTIVOS[0], mensaje: '' })
  const cambiar = (e) => setF({ ...f, [e.target.name]: e.target.value })
  const texto = `¡Hola! Soy ${f.nombre || '(nombre)'}.\nMotivo: ${f.motivo}\n${f.mensaje}`

  const enviar = (e) => {
    e.preventDefault()
    window.open(linkWhatsapp(contacto.whatsapp, texto), '_blank', 'noopener')
  }

  return (
    <section id="contacto" className="seccion seccion--lila">
      <div className="contenedor contacto">
        <div className="contacto__info">
          <span className="etiqueta etiqueta--lila">✉️ Contacto</span>
          <h2>¡Hablemos!</h2>
          <p>¿Tienes dudas sobre adopción, donaciones o quieres reportar un animal en riesgo? Escríbenos.</p>
          <ul className="contacto__lista">
            <li>📞 <a href={`tel:+502${soloDigitos(contacto.telefono)}`}>{contacto.telefono}</a></li>
            <li>💬 <a href={linkWhatsapp(contacto.whatsapp, contacto.mensajeWhatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp: {contacto.whatsappTexto}</a></li>
            <li>✉️ <a href={`mailto:${contacto.correo}`}>{contacto.correo}</a></li>
          </ul>
          <div className="redes">
            {redes.map((r) => (
              <a key={r.red} href={r.url} target="_blank" rel="noopener noreferrer" className={`red red--${r.red}`}>
                {ICONOS_RED[r.red] || '★'} {r.nombre}
              </a>
            ))}
          </div>
          <div className="contacto__gato" aria-hidden="true"><Gato color="#F2B26B" /></div>
        </div>

        <form className="formulario" onSubmit={enviar}>
          <label>
            Tu nombre
            <input name="nombre" value={f.nombre} onChange={cambiar} required placeholder="¿Cómo te llamas?" />
          </label>
          <label>
            Motivo
            <select name="motivo" value={f.motivo} onChange={cambiar}>
              {MOTIVOS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label>
            Mensaje
            <textarea name="mensaje" rows="4" value={f.mensaje} onChange={cambiar} required placeholder="Cuéntanos en qué te podemos ayudar" />
          </label>
          <button className="btn btn--rosa btn--ancho" type="submit">Enviar por WhatsApp 💬</button>
          <a className="enlace" href={`mailto:${contacto.correo}?subject=${encodeURIComponent(f.motivo)}&body=${encodeURIComponent(texto)}`}>
            o enviar por correo
          </a>
          <small className="privacidad">🔒 Este formulario no guarda tus datos; solo prepara el mensaje.</small>
        </form>
      </div>
      <Ola color="var(--noche)" />
    </section>
  )
}
