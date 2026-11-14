// Ilustraciones SVG propias (sin derechos de terceros).
// Se usan como "foto" mientras el albergue no comparta fotografías autorizadas.

const TRAZO = '#163832'

// ¿El color es claro? (para decidir contraste de detalles)
const esClaro = (hex = '#ffffff') => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return r * 0.299 + g * 0.587 + b * 0.114 > 150
}

function Ojos({ y = 98, sep = 26 }) {
  return (
    <g>
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={100 + s * sep} cy={y} rx="10" ry="12" fill={TRAZO} />
          <circle cx={100 + s * sep + 3} cy={y - 4} r="3.8" fill="#fff" />
          <circle cx={100 + s * sep - 3} cy={y + 4} r="1.6" fill="#fff" />
        </g>
      ))}
    </g>
  )
}

function Mejillas({ y = 118, sep = 42 }) {
  return (
    <g fill="#F49AC1" opacity=".7">
      <ellipse cx={100 - sep} cy={y} rx="10" ry="6" />
      <ellipse cx={100 + sep} cy={y} rx="10" ry="6" />
    </g>
  )
}

export function Perro({ color = '#E3A35A', manchas }) {
  const oreja = esClaro(color) ? '#C9B8A6' : shade(color, -25)
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Ilustración de perrito">
      {/* orejas caídas */}
      <ellipse cx="46" cy="88" rx="22" ry="44" transform="rotate(22 46 88)" fill={manchas || oreja} stroke={TRAZO} strokeWidth="4" />
      <ellipse cx="154" cy="88" rx="22" ry="44" transform="rotate(-22 154 88)" fill={oreja} stroke={TRAZO} strokeWidth="4" />
      {/* cabeza */}
      <ellipse cx="100" cy="108" rx="62" ry="58" fill={color} stroke={TRAZO} strokeWidth="4" />
      {manchas && <ellipse cx="74" cy="94" rx="22" ry="20" fill={manchas} />}
      {/* hocico */}
      <ellipse cx="100" cy="132" rx="30" ry="22" fill={esClaro(color) ? '#fff' : shade(color, 30)} />
      <Ojos />
      <Mejillas />
      <path d="M90 122 q10 -8 20 0 q-10 12 -20 0z" fill={TRAZO} />
      <path d="M100 128 v8 M100 136 q-8 8 -14 2 M100 136 q8 8 14 2" stroke={TRAZO} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M96 140 q4 12 8 0" fill="#F27A9B" />
    </svg>
  )
}

export function Gato({ color = '#F2B26B', manchas }) {
  const interior = '#F7B6CF'
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Ilustración de gatito">
      {/* orejas */}
      <path d="M46 92 L52 28 L96 62 Z" fill={color} stroke={TRAZO} strokeWidth="4" strokeLinejoin="round" />
      <path d="M154 92 L148 28 L104 62 Z" fill={manchas || color} stroke={TRAZO} strokeWidth="4" strokeLinejoin="round" />
      <path d="M58 76 L61 46 L84 64 Z" fill={interior} />
      <path d="M142 76 L139 46 L116 64 Z" fill={interior} />
      {/* cabeza */}
      <ellipse cx="100" cy="112" rx="64" ry="54" fill={color} stroke={TRAZO} strokeWidth="4" />
      {manchas && <path d="M120 64 q30 6 40 40 q-24 4 -40 -14z" fill={manchas} />}
      {!manchas && (
        <g stroke={shade(color, -35)} strokeWidth="5" strokeLinecap="round">
          <path d="M100 62 v14 M86 64 l3 12 M114 64 l-3 12" />
        </g>
      )}
      <Ojos y={104} sep={28} />
      <Mejillas y={124} sep={44} />
      <path d="M94 120 h12 l-6 7z" fill="#F27A9B" stroke={TRAZO} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 127 q-7 9 -14 3 M100 127 q7 9 14 3" stroke={TRAZO} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <g stroke={TRAZO} strokeWidth="2.5" strokeLinecap="round">
        <path d="M60 118 l-30 -4 M60 126 l-30 4 M140 118 l30 -4 M140 126 l30 4" />
      </g>
    </svg>
  )
}

export function AnimalIlustracion({ especie, color, manchas }) {
  return especie === 'gato' ? <Gato color={color} manchas={manchas} /> : <Perro color={color} manchas={manchas} />
}

export function Huella({ className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" aria-hidden="true">
      <g fill="currentColor">
        <ellipse cx="32" cy="42" rx="14" ry="12" />
        <ellipse cx="14" cy="26" rx="6" ry="8" />
        <ellipse cx="26" cy="15" rx="6" ry="8" />
        <ellipse cx="38" cy="15" rx="6" ry="8" />
        <ellipse cx="50" cy="26" rx="6" ry="8" />
      </g>
    </svg>
  )
}

export function Nube({ className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 200 90" aria-hidden="true">
      <path d="M30 80 a28 28 0 0 1 8 -54 a36 36 0 0 1 66 -10 a30 30 0 0 1 52 14 a26 26 0 0 1 14 50 z" fill="currentColor" />
    </svg>
  )
}

// Separador ondulado entre secciones
export function Ola({ color = 'var(--crema)', invertida = false }) {
  return (
    <svg className={`ola ${invertida ? 'ola--inv' : ''}`} viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 40 C 240 90 480 0 720 36 C 960 72 1200 10 1440 40 L1440 80 L0 80 Z" fill={color} />
    </svg>
  )
}

// Aclara / oscurece un color hex
function shade(hex, pct) {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (pct / 100) * 255)))
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}
