import { useEffect, useState } from 'react'

// Rutas simples con "#/": por ejemplo  sitio.com/#/peludito/canela
// Permite compartir el enlace directo a la ficha de un animal.
const leer = () => (window.location.hash.startsWith('#/') ? window.location.hash.slice(2) : '')

export function useRuta() {
  const [ruta, setRuta] = useState(leer)
  useEffect(() => {
    const f = () => setRuta(leer())
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return ruta
}

export const irA = (ruta) => {
  window.location.hash = `/${ruta}`
}

// Cierra la ruta actual sin mover la página
export const cerrarRuta = () => {
  history.pushState(null, '', window.location.pathname + window.location.search)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}
