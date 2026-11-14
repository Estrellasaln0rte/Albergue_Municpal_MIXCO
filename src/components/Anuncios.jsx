import { Ola } from './Ilustraciones.jsx'
import Compartir from './Compartir.jsx'
import { aFecha, hoy, mesCorto, fechaLarga, linkWhatsapp, rutaFoto } from '../utils.js'

const TIPOS = {
  adopcion: { txt: 'Jornada de adopción', icono: '🏡', clase: 'lila' },
  vacunacion: { txt: 'Vacunación', icono: '💉', clase: 'rosa' },
  esterilizacion: { txt: 'Esterilización', icono: '🩺', clase: 'menta' },
  campana: { txt: 'Campaña', icono: '📦', clase: 'amarillo' },
  aviso: { txt: 'Aviso importante', icono: '📢', clase: 'verde' },
}

export default function Anuncios({ anuncios, contacto }) {
  const vigentes = anuncios
    .filter((a) => aFecha(a.fechaFin) >= hoy())
    .sort((a, b) => aFecha(a.fechaInicio) - aFecha(b.fechaInicio))

  return (
    <section id="avisos" className="seccion seccion--crema">
      <div className="contenedor">
        <header className="titulo-seccion">
          <span className="etiqueta etiqueta--rosa">📣 Tablón de avisos</span>
          <h2>Jornadas, campañas y noticias</h2>
          <p>Entérate de lo que viene: adopciones, vacunación a bajo costo y formas de ayudar.</p>
        </header>

        {vigentes.length === 0 ? (
          <p className="vacio">Por ahora no hay avisos. ¡Síguenos en redes para enterarte primero! 🐶</p>
        ) : (
          <div className="anuncios">
            {vigentes.map((a) => {
              const t = TIPOS[a.tipo] || TIPOS.aviso
              const mismoDia = a.fechaInicio === a.fechaFin
              const enCurso = aFecha(a.fechaInicio) <= hoy()
              return (
                <article key={a.id} id={`aviso-${a.id}`} className={`anuncio anuncio--${t.clase}`}>
                  <div className="anuncio__fecha">
                    <strong>
                      {aFecha(a.fechaInicio).getDate()}
                      {!mismoDia && aFecha(a.fechaFin).getMonth() === aFecha(a.fechaInicio).getMonth() && (
                        <small> y {aFecha(a.fechaFin).getDate()}</small>
                      )}
                    </strong>
                    <span>{mesCorto(a.fechaInicio)}</span>
                  </div>
                  <div className="anuncio__cuerpo">
                    <div className="anuncio__tipo">
                      {t.icono} {t.txt} {enCurso && <span className="pildora">¡Ahora!</span>}
                    </div>
                    <h3>{a.titulo}</h3>
                    {a.imagen && <img src={rutaFoto(a.imagen)} alt={a.titulo} className="anuncio__img" loading="lazy" />}
                    <p>{a.descripcion}</p>
                    <ul className="anuncio__datos">
                      <li>🗓️ {fechaLarga(a.fechaInicio)}{!mismoDia && ` al ${fechaLarga(a.fechaFin)}`}</li>
                      {a.horario && <li>⏰ {a.horario}</li>}
                      {a.lugar && <li>📍 {a.lugar}</li>}
                    </ul>
                    <div className="anuncio__acciones">
                      {a.tipo !== 'aviso' && (
                        <a
                          className="enlace"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={linkWhatsapp(contacto.whatsapp, `¡Hola! Quisiera información sobre: ${a.titulo}`)}
                        >
                          Pedir información →
                        </a>
                      )}
                      <Compartir
                        titulo={a.titulo}
                        texto={`📣 ${a.titulo} · ${fechaLarga(a.fechaInicio)}${a.lugar ? ` · ${a.lugar}` : ''}`}
                        url={`${window.location.origin}${window.location.pathname}#aviso-${a.id}`}
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
      <Ola color="var(--verde)" />
    </section>
  )
}
