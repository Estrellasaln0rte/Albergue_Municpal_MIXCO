import { useEffect, useMemo, useState } from 'react'
import { AnimalIlustracion, Ola } from './Ilustraciones.jsx'
import Compartir, { enlaceA } from './Compartir.jsx'
import { linkWhatsapp, rutaFoto, fechaCorta } from '../utils.js'
import { useRuta, irA, cerrarRuta } from '../useRuta.js'

export const ESTADOS = {
  disponible: { txt: 'Busca hogar', clase: 'ok' },
  'en-proceso': { txt: 'En proceso de adopción', clase: 'proceso' },
  adoptado: { txt: '¡Adoptado! 🎉', clase: 'adoptado' },
}

export function Retrato({ animal, className = '' }) {
  return (
    <div className={`retrato ${className}`} style={{ '--fondo': animal.especie === 'gato' ? 'var(--lila-claro)' : 'var(--rosa-claro)' }}>
      {animal.foto ? (
        <img src={rutaFoto(animal.foto)} alt={`Foto de ${animal.nombre}`} loading="lazy" />
      ) : (
        <AnimalIlustracion especie={animal.especie} color={animal.color} manchas={animal.manchas} />
      )}
    </div>
  )
}

export default function Animales({ animales, actividades, contacto, onCuestionario }) {
  const [especie, setEspecie] = useState('todos')
  const [tamano, setTamano] = useState('todos')
  const [verAdoptados, setVerAdoptados] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const ruta = useRuta()

  // La ficha abierta depende de la dirección: #/peludito/<id>
  const elegido = ruta.startsWith('peludito/') ? animales.find((a) => a.id === ruta.split('/')[1]) : null

  const lista = useMemo(
    () =>
      animales.filter(
        (a) =>
          (especie === 'todos' || a.especie === especie) &&
          (tamano === 'todos' || a.tamano === tamano) &&
          (verAdoptados || a.estado !== 'adoptado') &&
          a.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
      ),
    [animales, especie, tamano, verAdoptados, busqueda]
  )

  return (
    <section id="peluditos" className="seccion seccion--verde">
      <div className="contenedor">
        <header className="titulo-seccion titulo-seccion--claro">
          <span className="etiqueta etiqueta--menta">🐶🐱 Adopta, no compres</span>
          <h2>Nuestros peluditos</h2>
          <p>Cada uno tiene su historia y su manera de querer. Toca una tarjeta para conocerlo mejor.</p>
        </header>

        <div className="filtros" role="group" aria-label="Filtros">
          <div className="filtros__grupo">
            {[['todos', 'Todos'], ['perro', '🐶 Perros'], ['gato', '🐱 Gatos']].map(([v, t]) => (
              <button key={v} className={`chip ${especie === v ? 'activo' : ''}`} onClick={() => setEspecie(v)}>{t}</button>
            ))}
          </div>
          <select value={tamano} onChange={(e) => setTamano(e.target.value)} aria-label="Tamaño">
            <option value="todos">Todos los tamaños</option>
            <option value="pequeño">Pequeño</option>
            <option value="mediano">Mediano</option>
            <option value="grande">Grande</option>
          </select>
          <input
            type="search"
            placeholder="Buscar por nombre…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar por nombre"
          />
          <label className="interruptor">
            <input type="checkbox" checked={verAdoptados} onChange={(e) => setVerAdoptados(e.target.checked)} />
            <span>Ver finales felices</span>
          </label>
        </div>

        {lista.length === 0 ? (
          <p className="vacio vacio--claro">No encontramos peluditos con esos filtros 🐾</p>
        ) : (
          <div className="tarjetas">
            {lista.map((a) => (
              <button key={a.id} className={`tarjeta ${a.estado === 'adoptado' ? 'tarjeta--adoptado' : ''}`} onClick={() => irA(`peludito/${a.id}`)}>
                <Retrato animal={a} />
                <span className={`estado estado--${ESTADOS[a.estado]?.clase}`}>{ESTADOS[a.estado]?.txt}</span>
                <div className="tarjeta__info">
                  <h3>{a.nombre} <span>{a.sexo === 'hembra' ? '♀' : '♂'}</span></h3>
                  <p>{a.edad} · {a.tamano}</p>
                  <div className="tarjeta__tags">
                    {(a.personalidad || []).slice(0, 2).map((p) => <span key={p}>{p}</span>)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <Ola color="var(--crema)" />

      {elegido && (
        <Ficha
          animal={elegido}
          diario={actividades.filter((x) => x.animales?.includes(elegido.id))}
          contacto={contacto}
          onCuestionario={() => onCuestionario(elegido)}
          onCerrar={cerrarRuta}
        />
      )}
    </section>
  )
}

function Ficha({ animal, diario, contacto, onCuestionario, onCerrar }) {
  useEffect(() => {
    // Con el cuestionario abierto encima, Escape solo cierra el cuestionario
    const esc = (e) => e.key === 'Escape' && !document.querySelector('.cuestionario') && onCerrar()
    const previo = document.body.style.overflow
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', esc)
      document.body.style.overflow = previo
    }
  }, [onCerrar])

  const s = animal.salud || {}
  const msg = `¡Hola! Vi a ${animal.nombre} en la página web y me gustaría saber cómo iniciar su proceso de adopción.`

  return (
    <div className="modal" onClick={onCerrar} role="dialog" aria-modal="true" aria-label={`Ficha de ${animal.nombre}`}>
      <div className="modal__caja" onClick={(e) => e.stopPropagation()}>
        <button className="modal__cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
        <div className="ficha">
          <Retrato animal={animal} className="retrato--grande" />
          <div className="ficha__info">
            <span className={`estado estado--${ESTADOS[animal.estado]?.clase}`}>{ESTADOS[animal.estado]?.txt}</span>
            <h3>{animal.nombre}</h3>
            <div className="ficha__datos">
              <span>{animal.especie === 'gato' ? '🐱 Gato' : '🐶 Perro'}</span>
              <span>{animal.sexo === 'hembra' ? '♀ Hembra' : '♂ Macho'}</span>
              <span>🎂 {animal.edad}</span>
              <span>📏 {animal.tamano}</span>
            </div>
            <p>{animal.historia}</p>
            <div className="ficha__tags">
              {(animal.personalidad || []).map((p) => <span key={p}>{p}</span>)}
            </div>
            <ul className="salud">
              <li className={s.vacunas ? 'si' : 'no'}>Vacunas</li>
              <li className={s.desparasitado ? 'si' : 'no'}>Desparasitado</li>
              <li className={s.esterilizado ? 'si' : 'no'}>Esterilizado</li>
            </ul>
            {animal.idealPara && <p className="ideal">🏠 <strong>Ideal para:</strong> {animal.idealPara}</p>}
            {animal.estado === 'adoptado' && animal.finalFeliz?.texto && (
              <p className="ideal ideal--feliz">💕 {animal.finalFeliz.texto}</p>
            )}

            {diario.length > 0 && (
              <div className="mini-diario">
                <h4>📔 Su diario en el albergue</h4>
                {diario.map((d) => (
                  <p key={d.id}><small>{fechaCorta(d.fecha)}</small> {d.emoji} {d.titulo}</p>
                ))}
              </div>
            )}

            {animal.estado !== 'adoptado' && (
              <>
                <a className="btn btn--rosa btn--ancho" href={linkWhatsapp(contacto.whatsapp, msg)} target="_blank" rel="noopener noreferrer">
                  Quiero adoptar a {animal.nombre} 💕
                </a>
                <button className="btn btn--contorno btn--ancho btn--sm" onClick={onCuestionario}>
                  📝 Llenar cuestionario previo
                </button>
              </>
            )}
            <div className="ficha__acciones">
              <Compartir
                titulo={`${animal.nombre} busca hogar`}
                texto={animal.estado === 'adoptado' ? `¡${animal.nombre} encontró familia! 🐾` : `¿Le das un hogar a ${animal.nombre}? 🐾`}
                url={enlaceA(`peludito/${animal.id}`)}
              />
              <a href="#adopcion" className="enlace" onClick={onCerrar}>¿Cómo funciona la adopción?</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
