import Logo from './Logo.jsx'

import { linkWhatsapp } from '../utils.js'

export default function Footer({ albergue }) {
  return (
    <footer className="pie">
      <div className="contenedor pie__grid">
        <div>
          <Logo logo={albergue.logo} claro />
          <p>{albergue.eslogan}. Adopta, dona, comparte.</p>
          {albergue.sede?.direccion && <p className="pie__dir">📍 {albergue.sede.direccion}</p>}
        </div>
        <nav>
          <h4>Explora</h4>
          <a href="#avisos">Avisos</a>
          <a href="#peluditos">Adopta</a>
          <a href="#diario">Diario</a>
          <a href="#adopcion">¿Cómo adopto?</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#sede">Sede y horarios</a>
          <a href="#donar">Donar</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <div>
          <h4>Síguenos</h4>
          {albergue.redes.map((r) => (
            <a key={r.red} href={r.url} target="_blank" rel="noopener noreferrer">{r.nombre}</a>
          ))}
          <a href={linkWhatsapp(albergue.contacto.whatsapp, albergue.contacto.mensajeWhatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          {albergue.contacto.correo && <a href={`mailto:${albergue.contacto.correo}`}>Correo</a>}
          <a className="pie__panel" href="./admin.html">🔒 Panel del albergue</a>
        </div>
      </div>
      <p className="pie__credito">
        © {new Date().getFullYear()} {albergue.nombre}{albergue.creditos ? ` · ${albergue.creditos}` : ''}
      </p>
    </footer>
  )
}
