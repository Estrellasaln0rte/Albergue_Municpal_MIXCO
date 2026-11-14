import { Huella } from './Ilustraciones.jsx'
import { rutaFoto } from '../utils.js'

// Logo del albergue. Se configura en albergue.json → "logo".
// Si "imagen" tiene una ruta (ej. "fotos/logo.png"), se usa esa imagen en lugar de la huella.
export default function Logo({ logo = {}, claro = false, como: Etiqueta = 'span', ...props }) {
  return (
    <Etiqueta className={`logo ${claro ? 'logo--claro' : ''}`} {...props}>
      {logo.imagen ? (
        <img className="logo__img" src={rutaFoto(logo.imagen)} alt="" />
      ) : (
        <span className="logo__icono"><Huella /></span>
      )}
      <span className="logo__texto">
        <small>{logo.linea1 ?? 'Albergue Municipal'}</small>
        {logo.linea2 ?? 'Mascotas Mixco'}
      </span>
    </Etiqueta>
  )
}
