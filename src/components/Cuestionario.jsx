import { useEffect, useState } from 'react'
import { linkWhatsapp } from '../utils.js'

// Cuestionario previo de adopción.
// NO guarda nada: al final arma un mensaje de WhatsApp con las respuestas
// para que el albergue no tenga que hacer las mismas preguntas cada vez.
export default function Cuestionario({ cuestionario, contacto, animal, onCerrar }) {
  const [resp, setResp] = useState({ nombre: '' })
  const preguntas = cuestionario.preguntas

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onCerrar()
    const previo = document.body.style.overflow
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', esc)
      document.body.style.overflow = previo
    }
  }, [onCerrar])

  const poner = (id, v) => setResp({ ...resp, [id]: v })
  const respondidas = preguntas.filter((p) => (resp[p.id] || '').trim()).length
  const completo = resp.nombre.trim() && preguntas.every((p) => p.opcional || (resp[p.id] || '').trim())

  const mensaje = [
    `¡Hola! Soy ${resp.nombre.trim()} y quiero iniciar un proceso de adopción${animal ? ` para ${animal.nombre}` : ''}.`,
    '',
    'Mis respuestas al cuestionario:',
    ...preguntas.filter((p) => (resp[p.id] || '').trim()).map((p) => `• ${p.pregunta} ${resp[p.id].trim()}`),
  ].join('\n')

  const enviar = (e) => {
    e.preventDefault()
    if (!completo) return
    window.open(linkWhatsapp(contacto.whatsapp, mensaje), '_blank', 'noopener')
  }

  return (
    <div className="modal" onClick={onCerrar} role="dialog" aria-modal="true" aria-label="Cuestionario de adopción">
      <div className="modal__caja modal__caja--estrecha" onClick={(e) => e.stopPropagation()}>
        <button className="modal__cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
        <form className="cuestionario" onSubmit={enviar}>
          <span className="etiqueta etiqueta--rosa">📝 Solicitud de adopción</span>
          <h3>{animal ? `Quiero adoptar a ${animal.nombre}` : 'Cuéntanos sobre ti'}</h3>
          <p className="cuestionario__intro">{cuestionario.intro}</p>
          <div className="progreso" aria-hidden="true">
            <span style={{ width: `${(respondidas / preguntas.length) * 100}%` }} />
          </div>

          <label className="pregunta">
            <span>Tu nombre</span>
            <input value={resp.nombre} onChange={(e) => poner('nombre', e.target.value)} required placeholder="Nombre y apellido" />
          </label>

          {preguntas.map((p) => (
            <fieldset key={p.id} className="pregunta">
              <legend>{p.pregunta} {p.opcional && <small>(opcional)</small>}</legend>
              {p.tipo === 'opciones' ? (
                <div className="opciones">
                  {p.opciones.map((o) => (
                    <label key={o} className={`opcion ${resp[p.id] === o ? 'activa' : ''}`}>
                      <input type="radio" name={p.id} value={o} checked={resp[p.id] === o} onChange={() => poner(p.id, o)} />
                      {o}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea rows="2" value={resp[p.id] || ''} onChange={(e) => poner(p.id, e.target.value)} placeholder="Escribe tu respuesta" />
              )}
            </fieldset>
          ))}

          <button className="btn btn--rosa btn--ancho" type="submit" disabled={!completo}>
            {completo ? 'Enviar por WhatsApp 💬' : 'Responde todas las preguntas para continuar'}
          </button>
          {cuestionario.formularioExterno && (
            <a className="enlace" href={cuestionario.formularioExterno} target="_blank" rel="noopener noreferrer">
              o llena el formulario oficial →
            </a>
          )}
          <small className="privacidad">🔒 Esta página no guarda tus respuestas; solo prepara el mensaje.</small>
        </form>
      </div>
    </div>
  )
}
