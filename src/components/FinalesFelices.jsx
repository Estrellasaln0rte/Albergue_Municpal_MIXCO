import { Retrato } from './Animales.jsx'
import { irA } from '../useRuta.js'
import { aFecha, fechaCorta, rutaFoto } from '../utils.js'

// Muestra los animales con estado "adoptado" que tengan "finalFeliz" en su ficha.
// Usa fotos de la familia SOLO con su permiso.
export default function FinalesFelices({ animales }) {
  const felices = animales
    .filter((a) => a.estado === 'adoptado' && a.finalFeliz?.texto)
    .sort((a, b) => aFecha(b.finalFeliz.fecha || '2000-01-01') - aFecha(a.finalFeliz.fecha || '2000-01-01'))
    .slice(0, 6)

  if (felices.length === 0) return null

  return (
    <section id="finales-felices" className="seccion seccion--rosa seccion--sin-ola">
      <div className="contenedor">
        <header className="titulo-seccion">
          <span className="etiqueta etiqueta--rosa">💕 Finales felices</span>
          <h2>Ya están en casa</h2>
          <p>Gracias a cada familia que eligió adoptar. Estas historias nos recuerdan por qué lo hacemos.</p>
        </header>
        <div className="felices">
          {felices.map((a) => (
            <button key={a.id} className="feliz" onClick={() => irA(`peludito/${a.id}`)}>
              {a.finalFeliz.foto ? (
                <div className="retrato"><img src={rutaFoto(a.finalFeliz.foto)} alt={`${a.nombre} en su nuevo hogar`} loading="lazy" /></div>
              ) : (
                <Retrato animal={a} />
              )}
              <div className="feliz__texto">
                <h3>{a.nombre} 🏡</h3>
                {a.finalFeliz.fecha && <small>Adoptado el {fechaCorta(a.finalFeliz.fecha)}</small>}
                <p>“{a.finalFeliz.texto}”</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
