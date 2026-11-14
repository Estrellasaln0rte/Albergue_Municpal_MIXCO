import { useEffect, useState } from 'react'
import { cargarDatos, linkWhatsapp } from './utils.js'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Anuncios from './components/Anuncios.jsx'
import Animales from './components/Animales.jsx'
import Actividades from './components/Actividades.jsx'
import FinalesFelices from './components/FinalesFelices.jsx'
import Adopcion from './components/Adopcion.jsx'
import Nosotros from './components/Nosotros.jsx'
import Donaciones from './components/Donaciones.jsx'
import Contacto from './components/Contacto.jsx'
import Footer from './components/Footer.jsx'
import Cuestionario from './components/Cuestionario.jsx'
import { Huella } from './components/Ilustraciones.jsx'

export default function App() {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(null)
  // null = cerrado; { animal } = abierto (animal puede ser null si es una solicitud general)
  const [solicitud, setSolicitud] = useState(null)

  useEffect(() => {
    cargarDatos().then(setDatos).catch((e) => setError(e.message))
  }, [])

  // Título de la pestaña con el nombre del albergue
  useEffect(() => {
    if (datos?.albergue?.nombre) document.title = datos.albergue.nombre
  }, [datos])

  // Si se abrió un enlace con #seccion, ir a ella cuando los datos ya cargaron
  useEffect(() => {
    const h = window.location.hash
    if (datos && /^#[\w-]+$/.test(h)) document.getElementById(h.slice(1))?.scrollIntoView()
  }, [datos])

  if (error)
    return (
      <div className="cargando">
        <p>😿 {error}</p>
        <small>Revisa que los archivos de la carpeta <code>datos/</code> tengan un formato JSON válido.</small>
      </div>
    )

  if (!datos)
    return (
      <div className="cargando">
        <Huella className="cargando__huella" />
        <p>Cargando peluditos…</p>
      </div>
    )

  const { albergue, animales, anuncios, actividades, necesidades } = datos
  const { contacto } = albergue
  const abrirSolicitud = (animal = null) => setSolicitud({ animal })

  return (
    <>
      <Navbar albergue={albergue} anuncios={anuncios} />
      <main>
        <Hero albergue={albergue} animales={animales} />
        <Anuncios anuncios={anuncios} contacto={contacto} />
        <Animales animales={animales} actividades={actividades} contacto={contacto} onCuestionario={abrirSolicitud} />
        <Actividades actividades={actividades} animales={animales} />
        <FinalesFelices animales={animales} />
        <Adopcion adopcion={albergue.adopcion} contacto={contacto} onSolicitar={() => abrirSolicitud()} />
        <Nosotros albergue={albergue} />
        <Donaciones donaciones={albergue.donaciones} necesidades={necesidades} contacto={contacto} />
        <Contacto albergue={albergue} />
      </main>
      <Footer albergue={albergue} />

      {solicitud && (
        <Cuestionario
          cuestionario={albergue.adopcion.cuestionario}
          contacto={contacto}
          animal={solicitud.animal}
          onCerrar={() => setSolicitud(null)}
        />
      )}

      <a
        className="wa-flotante"
        href={linkWhatsapp(contacto.whatsapp, contacto.mensajeWhatsapp)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
      >
        <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-1-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.2 1.3 3.4c.2.2 2.3 3.5 5.6 4.9 2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>
      </a>
    </>
  )
}
