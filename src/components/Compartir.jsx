import { useState } from 'react'

// Botón para compartir un enlace. En celulares usa el menú nativo de compartir;
// en computadora muestra WhatsApp, Facebook y "copiar enlace".
export default function Compartir({ titulo, texto, url, claro = false }) {
  const [abierto, setAbierto] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const compartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto, url })
        return
      } catch (e) {
        if (e.name === 'AbortError') return
      }
    }
    setAbierto(!abierto)
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch { /* sin permiso para copiar */ }
  }

  const enc = encodeURIComponent
  return (
    <div className={`compartir ${claro ? 'compartir--claro' : ''}`}>
      <button type="button" className="compartir__btn" onClick={compartir} aria-expanded={abierto}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7l-6.7 3.4a3 3 0 1 0 0 3.2L15 17a3 3 0 1 0 3-1z"/></svg>
        Compartir
      </button>
      {abierto && (
        <div className="compartir__menu">
          <a href={`https://wa.me/?text=${enc(`${texto} ${url}`)}`} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer">📘 Facebook</a>
          <button type="button" onClick={copiar}>{copiado ? '✓ ¡Copiado!' : '🔗 Copiar enlace'}</button>
        </div>
      )}
    </div>
  )
}

// Enlace directo a una parte de la página (ej. la ficha de un animal)
export const enlaceA = (ruta) => `${window.location.origin}${window.location.pathname}#/${ruta}`
