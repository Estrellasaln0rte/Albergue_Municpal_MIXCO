import { useState } from 'react'
import { Ola } from './Ilustraciones.jsx'
import { linkWhatsapp } from '../utils.js'

const PRIORIDAD = { alta: '🔴 Urgente', media: '🟡 Pronto', baja: '🟢 Siempre útil' }

export default function Donaciones({ donaciones, necesidades = [], contacto }) {
  const transp = donaciones.transparencia
  const [copiado, setCopiado] = useState(null)

  const copiar = async (texto, i) => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(i)
      setTimeout(() => setCopiado(null), 1800)
    } catch { /* el navegador no permitió copiar */ }
  }

  return (
    <section id="donar" className="seccion seccion--oscura">
      <div className="contenedor">
        <header className="titulo-seccion titulo-seccion--claro">
          <span className="etiqueta etiqueta--menta">💚 Dona</span>
          <h2>Tu ayuda llena platos y corazones</h2>
          <p>{donaciones.intro}</p>
        </header>

        {/* ----- Versión inicial: donación monetaria y en especie ----- */}
        <div className="donar">
          <div className="donar__col">
            <h3>Donación monetaria</h3>
            {donaciones.cuentas.map((c, i) => (
              <div key={i} className="cuenta">
                <div>
                  <small>{c.banco} · {c.tipo}</small>
                  <strong>{c.numero}</strong>
                  <span>{c.nombre}</span>
                </div>
                <button className="btn btn--sm btn--blanco" onClick={() => copiar(c.numero, i)}>
                  {copiado === i ? '¡Copiado! ✓' : 'Copiar'}
                </button>
              </div>
            ))}
            {donaciones.enlacePago.activo ? (
              <a className="btn btn--rosa btn--ancho" href={donaciones.enlacePago.url} target="_blank" rel="noopener noreferrer">
                {donaciones.enlacePago.texto} 🔒
              </a>
            ) : (
              <p className="nota">🔒 {donaciones.enlacePago.nota}</p>
            )}
            <a
              className="enlace enlace--claro"
              href={linkWhatsapp(contacto.whatsapp, '¡Hola! Hice una donación y quisiera enviar mi comprobante.')}
              target="_blank" rel="noopener noreferrer"
            >
              ¿Ya donaste? Envíanos tu comprobante →
            </a>
          </div>

          <div className="donar__col">
            <h3>Donación en especie</h3>
            <div className="insumos">
              {donaciones.insumos.map((x) => (
                <div key={x.nombre} className="insumo">
                  <span className="insumo__icono">{x.icono}</span>
                  <strong>{x.nombre}</strong>
                  <small>{x.detalle}</small>
                </div>
              ))}
            </div>
            <p className="entrega">📦 Puedes entregar tus donaciones en <a href="#sede">nuestra sede</a> en horario de atención, o <a href={linkWhatsapp(contacto.whatsapp, '¡Hola! Quiero donar insumos. ¿Pueden recogerlos o dónde los entrego?')} target="_blank" rel="noopener noreferrer">coordinar por WhatsApp</a>.</p>
            <div className="voluntario">
              <h4>🙋 Voluntariado</h4>
              <p>{donaciones.voluntariado}</p>
              <a className="btn btn--blanco btn--sm" href={linkWhatsapp(contacto.whatsapp, '¡Hola! Me gustaría ser voluntario/a en el albergue. ¿Qué horarios tienen?')} target="_blank" rel="noopener noreferrer">
                Quiero ser voluntario/a
              </a>
            </div>
          </div>
        </div>

        {/* ----- Agregado: necesidades urgentes y transparencia ----- */}
        {necesidades.length > 0 && (
          <div className="urgentes">
            <h3>🚨 Lo que más necesitamos ahora</h3>
            <ul>
              {necesidades.map((n) => (
                <li key={n.nombre} className={`urgente urgente--${n.prioridad || 'media'}`}>
                  <span className="urgente__prio">{PRIORIDAD[n.prioridad] || PRIORIDAD.media}</span>
                  <strong>{n.nombre}</strong>
                  {n.detalle && <small>{n.detalle}</small>}
                  <a className="urgente__btn" href={linkWhatsapp(contacto.whatsapp, `¡Hola! Quiero donar: ${n.nombre}. ¿Cómo lo entrego?`)} target="_blank" rel="noopener noreferrer">Yo lo dono →</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {transp?.items?.length > 0 && (
          <div className="transparencia">
            <div className="transparencia__cabeza">
              <h3>📊 Transparencia · {transp.periodo}</h3>
              {transp.nota && <small>{transp.nota}</small>}
            </div>
            <div className="transparencia__items">
              {transp.items.map((t) => {
                const pct = t.meta ? Math.min(100, Math.round((t.valor / t.meta) * 100)) : null
                return (
                  <div key={t.texto} className="meta">
                    <div className="meta__fila">
                      <span>{t.texto}</span>
                      <strong>{t.valor.toLocaleString('es-GT')} {t.unidad}{t.meta ? ` / ${t.meta.toLocaleString('es-GT')}` : ''}</strong>
                    </div>
                    {pct !== null && (
                      <div className="meta__barra" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label={t.texto}>
                        <span style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <Ola color="var(--lila-claro)" />
    </section>
  )
}
