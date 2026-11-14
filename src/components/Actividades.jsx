import { useState } from 'react'
import { Ola } from './Ilustraciones.jsx'
import { Retrato } from './Animales.jsx'
import { irA } from '../useRuta.js'
import { aFecha, fechaLarga, rutaFoto } from '../utils.js'

const POR_PAGINA = 3

export default function Actividades({ actividades, animales }) {
  const [mostrar, setMostrar] = useState(POR_PAGINA)
  const ordenadas = [...actividades].sort((a, b) => aFecha(b.fecha) - aFecha(a.fecha))
  const porId = Object.fromEntries(animales.map((a) => [a.id, a]))

  return (
    <section id="diario" className="seccion seccion--crema">
      <div className="contenedor">
        <header className="titulo-seccion">
          <span className="etiqueta etiqueta--lila">📔 Diario del albergue</span>
          <h2>¿Qué hacen hoy los peluditos?</h2>
          <p>Baños, paseos, chequeos y finales felices. Así se vive el día a día en el refugio.</p>
        </header>

        <ol className="linea-tiempo">
          {ordenadas.slice(0, mostrar).map((act) => (
            <li key={act.id} className="actividad">
              <span className="actividad__punto">{act.emoji || '🐾'}</span>
              <article className="actividad__caja">
                <time>{fechaLarga(act.fecha)}</time>
                <h3>{act.titulo}</h3>
                {act.foto && <img src={rutaFoto(act.foto)} alt={act.titulo} loading="lazy" />}
                <p>{act.texto}</p>
                {act.animales?.length > 0 && (
                  <div className="actividad__animales">
                    {act.animales.map((id) =>
                      porId[id] ? (
                        <button key={id} className="mini-avatar" title={`Ver la ficha de ${porId[id].nombre}`} onClick={() => irA(`peludito/${id}`)}>
                          <Retrato animal={porId[id]} />
                          {porId[id].nombre}
                        </button>
                      ) : null
                    )}
                  </div>
                )}
              </article>
            </li>
          ))}
        </ol>

        {mostrar < ordenadas.length && (
          <div className="centrado">
            <button className="btn btn--contorno" onClick={() => setMostrar(mostrar + POR_PAGINA)}>Ver más historias</button>
          </div>
        )}
      </div>
      <Ola color="var(--rosa-claro)" />
    </section>
  )
}
