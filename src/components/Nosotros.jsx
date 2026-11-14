import { Ola, Huella } from './Ilustraciones.jsx'

export default function Nosotros({ albergue }) {
  const { historia, sede } = albergue
  return (
    <section id="nosotros" className="seccion seccion--crema">
      <div className="contenedor">
        <header className="titulo-seccion">
          <span className="etiqueta etiqueta--menta">📖 Nuestra historia</span>
          <h2>Quiénes somos</h2>
          <p>{historia.intro}</p>
        </header>

        <div className="mision-vision">
          <div className="mv mv--mision">
            <h3>🎯 Misión</h3>
            <p>{historia.mision}</p>
          </div>
          <div className="mv mv--vision">
            <h3>🌱 Visión</h3>
            <p>{historia.vision}</p>
          </div>
        </div>

        <ol className="hitos">
          {historia.hitos.map((h, i) => (
            <li key={i} className="hito">
              <Huella className="hito__huella" />
              <span className="hito__anio">{h.anio}</span>
              <h3>{h.titulo}</h3>
              <p>{h.texto}</p>
            </li>
          ))}
        </ol>

        {/* ----- SEDE ----- */}
        <div id="sede" className="sede">
          <div className="sede__info">
            <span className="etiqueta etiqueta--lila">📍 Nuestra sede</span>
            <h2>Visítanos</h2>
            <p className="sede__dir"><strong>{sede.direccion}</strong><br />{sede.referencia}</p>
            <table className="horarios">
              <tbody>
                {sede.horarios.map((h) => (
                  <tr key={h.dias}><th>{h.dias}</th><td>{h.horas}</td></tr>
                ))}
              </tbody>
            </table>
            <h3>Servicios</h3>
            <ul className="servicios">
              {sede.servicios.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <a href={sede.mapaLink} className="btn btn--verde" target="_blank" rel="noopener noreferrer">Cómo llegar 🗺️</a>
          </div>
          <div className="sede__mapa">
            <iframe title="Mapa de la sede" src={sede.mapaEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </div>
      <Ola color="var(--verde-oscuro)" />
    </section>
  )
}
