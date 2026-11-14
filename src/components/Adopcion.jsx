import { Ola } from './Ilustraciones.jsx'
import { linkWhatsapp } from '../utils.js'

export default function Adopcion({ adopcion, contacto, onSolicitar }) {
  return (
    <section id="adopcion" className="seccion seccion--rosa">
      <div className="contenedor">
        <header className="titulo-seccion">
          <span className="etiqueta etiqueta--rosa">🏡 Adopción responsable</span>
          <h2>¿Cómo adopto?</h2>
          <p>Un proceso sencillo y cuidadoso, para que cada adopción sea para siempre.</p>
        </header>

        <ol className="pasos">
          {adopcion.pasos.map((p, i) => (
            <li key={p.titulo} className="paso">
              <span className="paso__num">{i + 1}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>

        <div className="adopcion__abajo">
          <div className="requisitos">
            <h3>📋 Requisitos</h3>
            <ul>
              {adopcion.requisitos.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
          <div className="aviso-etico">
            <span className="aviso-etico__icono">💭</span>
            <p>{adopcion.aviso}</p>
            <div className="aviso-etico__botones">
              <a className="btn btn--verde" href={linkWhatsapp(contacto.whatsapp, '¡Hola! Quiero iniciar un proceso de adopción. ¿Qué debo hacer?')} target="_blank" rel="noopener noreferrer">
                Iniciar mi solicitud
              </a>
              <button className="btn btn--contorno-claro" onClick={onSolicitar}>
                📝 Llenar cuestionario previo
              </button>
            </div>
          </div>
        </div>
      </div>
      <Ola color="var(--crema)" />
    </section>
  )
}
