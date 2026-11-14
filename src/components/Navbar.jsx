import { useEffect, useState } from 'react'
import Logo from './Logo.jsx'
import { aFecha, hoy, fechaLarga } from '../utils.js'

const ENLACES = [
  ['#avisos', 'Avisos'],
  ['#peluditos', 'Adopta'],
  ['#diario', 'Diario'],
  ['#nosotros', 'Nosotros'],
  ['#sede', 'Sede'],
  ['#contacto', 'Contacto'],
]

export default function Navbar({ albergue, anuncios }) {
  const [abierto, setAbierto] = useState(false)
  const [scroll, setScroll] = useState(false)
  const [cerrarAviso, setCerrarAviso] = useState(false)

  useEffect(() => {
    const f = () => setScroll(window.scrollY > 30)
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  const destacado = anuncios.find((a) => a.destacado && aFecha(a.fechaFin) >= hoy())

  return (
    <header className={`cabecera ${scroll ? 'cabecera--scroll' : ''}`}>
      {destacado && !cerrarAviso && (
        <div className="barra-aviso">
          <a href={`#aviso-${destacado.id}`}>
            📣 <strong>{destacado.titulo}</strong> · {fechaLarga(destacado.fechaInicio)}
            {destacado.lugar && ` · ${destacado.lugar}`}
          </a>
          <button onClick={() => setCerrarAviso(true)} aria-label="Cerrar aviso">×</button>
        </div>
      )}
      <nav className="nav contenedor">
        <Logo como="a" href="#inicio" logo={albergue.logo} onClick={() => setAbierto(false)} />
        <button
          className={`hamburguesa ${abierto ? 'abierto' : ''}`}
          onClick={() => setAbierto(!abierto)}
          aria-label="Abrir menú"
          aria-expanded={abierto}
        >
          <span /><span /><span />
        </button>
        <ul className={`nav__links ${abierto ? 'abierto' : ''}`}>
          {ENLACES.map(([href, txt]) => (
            <li key={href}><a href={href} onClick={() => setAbierto(false)}>{txt}</a></li>
          ))}
          <li><a href="#donar" className="btn btn--rosa btn--sm" onClick={() => setAbierto(false)}>Donar 💚</a></li>
        </ul>
      </nav>
    </header>
  )
}
