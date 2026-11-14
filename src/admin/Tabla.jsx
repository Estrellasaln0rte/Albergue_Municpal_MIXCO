import { useEffect, useMemo, useState } from 'react'
import { ESQUEMAS, mostrar, etiquetaDe } from './esquemas.js'

// Lista con búsqueda + botón para agregar. Sirve para cualquier tabla del esquema.
export function Tabla({ tabla, db, onEditar, onNuevo, onVer, filtroInicial = '' }) {
  const esq = ESQUEMAS[tabla]
  const [q, setQ] = useState(filtroInicial)
  const [estado, setEstado] = useState('todos')
  const campoEstado = esq.campos.find((c) => c.k === 'estado')
  const colCampos = esq.columnas.map((k) => esq.campos.find((c) => c.k === k))

  const filas = useMemo(() => {
    const t = q.trim().toLowerCase()
    return [...(db[tabla] || [])]
      .filter((r) => estado === 'todos' || r.estado === estado)
      .filter((r) => !t || esq.campos.some((c) => mostrar(c, r[c.k], db).toLowerCase().includes(t)))
      .sort(esq.orden)
  }, [db, tabla, q, estado, esq])

  return (
    <div className="p-tabla">
      <div className="p-barra">
        <input type="search" placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
        {campoEstado && (
          <select value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado">
            <option value="todos">Todos los estados</option>
            {Object.entries(campoEstado.op).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        )}
        <span className="p-cuenta">{filas.length} registro{filas.length === 1 ? '' : 's'}</span>
        <button className="btn btn--rosa btn--sm" onClick={onNuevo}>+ Agregar {esq.singular}</button>
      </div>
      {esq.ayuda && <p className="p-ayuda">ℹ️ {esq.ayuda}</p>}

      {filas.length === 0 ? (
        <p className="p-vacio">Todavía no hay registros. Usa “Agregar {esq.singular}”.</p>
      ) : (
        <div className="p-scroll">
          <table>
            <thead>
              <tr>
                {colCampos.map((c) => <th key={c.k}>{c.l}</th>)}
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {filas.map((r) => (
                <tr key={r.id}>
                  {colCampos.map((c) => (
                    <td key={c.k} data-l={c.l}>
                      {c.k === 'estado' ? <span className={`p-estado p-estado--${r.estado}`}>{mostrar(c, r[c.k], db)}</span> : mostrar(c, r[c.k], db) || '—'}
                    </td>
                  ))}
                  <td className="p-acciones">
                    {onVer && <button className="p-link" onClick={() => onVer(r)}>Expediente</button>}
                    <button className="p-link" onClick={() => onEditar(r)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Formulario para crear / editar un registro
export function Formulario({ tabla, registro, db, onGuardar, onBorrar, onCerrar }) {
  const esq = ESQUEMAS[tabla]
  const [r, setR] = useState(registro)
  const [error, setError] = useState('')
  const esNuevo = !registro.id

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onCerrar])

  const poner = (k, v) => setR((x) => ({ ...x, [k]: v }))

  const enviar = (e) => {
    e.preventDefault()
    const falta = esq.campos.find((c) => c.req && (r[c.k] === undefined || r[c.k] === ''))
    if (falta) return setError(`Falta: ${falta.l}`)
    onGuardar(r)
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={`${esNuevo ? 'Nuevo' : 'Editar'} ${esq.singular}`} onClick={onCerrar}>
      <div className="modal__caja p-form" onClick={(e) => e.stopPropagation()}>
        <button className="modal__cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
        <h3>{esq.icono} {esNuevo ? `${esq.femenino ? "Nueva" : "Nuevo"} ${esq.singular}` : `Editar ${esq.singular}`}</h3>
        {esq.privado && <p className="p-privado">🔒 Contiene datos personales: no se publica en la web.</p>}
        <form onSubmit={enviar} className="p-campos">
          {esq.campos.map((c) => (
            <Campo key={c.k} campo={c} valor={r[c.k]} db={db} onCambio={(v) => poner(c.k, v)} />
          ))}
          {error && <p className="p-error">{error}</p>}
          <div className="p-botones">
            {!esNuevo && (
              <button
                type="button"
                className="btn btn--sm p-borrar"
                onClick={() => window.confirm(`¿Eliminar este registro de ${esq.singular}? No se puede deshacer.`) && onBorrar(r)}
              >
                Eliminar
              </button>
            )}
            <button type="button" className="btn btn--blanco btn--sm" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn btn--rosa btn--sm">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Campo({ campo: c, valor, db, onCambio }) {
  const id = `campo-${c.k}`
  const ancho = ['area', 'etiquetas'].includes(c.t) ? 'p-campo--ancho' : ''
  let control
  switch (c.t) {
    case 'area':
      control = <textarea id={id} rows="3" value={valor || ''} onChange={(e) => onCambio(e.target.value)} placeholder={c.ph} />
      break
    case 'fecha':
      control = <input id={id} type="date" value={valor || ''} onChange={(e) => onCambio(e.target.value)} />
      break
    case 'numero':
      control = <input id={id} type="number" min="0" step="0.01" value={valor ?? ''} onChange={(e) => onCambio(e.target.value === '' ? '' : Number(e.target.value))} />
      break
    case 'opciones':
      control = (
        <select id={id} value={valor || ''} onChange={(e) => onCambio(e.target.value)}>
          {!c.req && <option value="">—</option>}
          {Object.entries(c.op).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
      )
      break
    case 'casilla':
      return (
        <label className="p-campo p-casilla">
          <input type="checkbox" checked={!!valor} onChange={(e) => onCambio(e.target.checked)} />
          <span>{c.l}{c.ayuda && <small>{c.ayuda}</small>}</span>
        </label>
      )
    case 'color':
      control = <input id={id} type="color" value={valor || '#E3A35A'} onChange={(e) => onCambio(e.target.value)} />
      break
    case 'colorOpcional':
      control = (
        <div className="p-color">
          <label><input type="checkbox" checked={!!valor} onChange={(e) => onCambio(e.target.checked ? '#3A3330' : '')} /> Tiene manchas</label>
          {valor && <input id={id} type="color" value={valor} onChange={(e) => onCambio(e.target.value)} />}
        </div>
      )
      break
    case 'etiquetas':
      control = (
        <input
          id={id}
          value={Array.isArray(valor) ? valor.join(', ') : valor || ''}
          onChange={(e) => onCambio(e.target.value.split(',').map((x) => x.trimStart()))}
          onBlur={(e) => onCambio(e.target.value.split(',').map((x) => x.trim()).filter(Boolean))}
          placeholder={c.ph}
        />
      )
      break
    case 'ref': {
      const opciones = [...(db[c.ref] || [])]
        .map((x) => ({ id: x.id, txt: etiquetaDe(c.ref, x.id, db) }))
        .sort((a, b) => a.txt.localeCompare(b.txt, 'es'))
      control = (
        <select id={id} value={valor || ''} onChange={(e) => onCambio(e.target.value)}>
          <option value="">— Seleccionar —</option>
          {opciones.map((o) => <option key={o.id} value={o.id}>{o.txt}</option>)}
        </select>
      )
      break
    }
    default:
      control = <input id={id} value={valor || ''} onChange={(e) => onCambio(e.target.value)} placeholder={c.ph} />
  }
  return (
    <div className={`p-campo ${ancho}`}>
      <label htmlFor={id}>{c.l}{c.req && <b aria-hidden="true"> *</b>}</label>
      {control}
      {c.ayuda && <small>{c.ayuda}</small>}
    </div>
  )
}
