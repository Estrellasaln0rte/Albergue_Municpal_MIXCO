import { Perro, Gato, Nube, Huella, Ola } from './Ilustraciones.jsx'

export default function Hero({ albergue, animales }) {
  const disponibles = animales.filter((a) => a.estado === 'disponible').length
  return (
    <section id="inicio" className="hero">
      <Nube className="hero__nube n1" />
      <Nube className="hero__nube n2" />
      <Nube className="hero__nube n3" />
      <span className="hero__estrella s1">✦</span>
      <span className="hero__estrella s2">✦</span>
      <span className="hero__estrella s3">✧</span>

      <div className="contenedor hero__grid">
        <div className="hero__texto">
          <span className="etiqueta">🐾 {albergue.nombre}</span>
          <h1>
            {albergue.eslogan.split(' ').slice(0, -2).join(' ')}{' '}
            <span className="resalte">{albergue.eslogan.split(' ').slice(-2).join(' ')}</span>
          </h1>
          <p>{albergue.descripcion}</p>
          <div className="hero__botones">
            <a href="#peluditos" className="btn btn--rosa">Conoce a los {disponibles} peluditos</a>
            <a href="#donar" className="btn btn--blanco">Quiero ayudar</a>
          </div>
        </div>

        <div className="hero__escena" aria-hidden="true">
          <div className="hero__luna" />
          <svg className="hero__colinas" viewBox="0 0 500 260" preserveAspectRatio="none">
            <path d="M0 150 Q120 60 250 120 T500 100 V260 H0Z" fill="#235347" />
            <path d="M0 200 Q150 120 300 180 T500 160 V260 H0Z" fill="#8EB69B" />
          </svg>
          <div className="hero__mascota hero__perro"><Perro color="#E3A35A" /></div>
          <div className="hero__mascota hero__gato"><Gato color="#3A3A40" manchas="#FFFFFF" /></div>
          <div className="hero__burbuja">¡Adóptame! 💕</div>
          <Huella className="hero__huella h1" />
          <Huella className="hero__huella h2" />
        </div>
      </div>

      <div className="contenedor cifras">
        {albergue.cifras.map((c) => (
          <div key={c.texto} className="cifra">
            <strong>{c.valor}</strong>
            <span>{c.texto}</span>
          </div>
        ))}
      </div>
      <Ola color="var(--crema)" />
    </section>
  )
}
