import { useCallback, useEffect, useState } from 'react'
import * as BD from './db.js'
import { ESQUEMAS, ESTADOS_ANIMAL, fechaBonita, etiquetaDe, mostrar, hoyISO } from './esquemas.js'
import { Tabla, Formulario } from './Tabla.jsx'
import { proximosProcedimientos, seguimientosPendientes, adopcionesPorMes, EN_ALBERGUE, jsonPublico, csvPublico, csvTabla, descargar, animalesPublicos, leerMensajeWhatsapp } from './logica.js'
import { datosDeEjemplo } from './ejemplo.js'
import { AnimalIlustracion, Huella } from '../components/Ilustraciones.jsx'

const VISTAS = [
  ['tablero', '📊', 'Tablero'],
  ['animales', '🐾', 'Animales'],
  ['procedimientos', '🩺', 'Procedimientos'],
  ['solicitudes', '📝', 'Solicitudes'],
  ['adopciones', '🏡', 'Adopciones'],
  ['seguimientos', '📞', 'Seguimientos'],
  ['respaldo', '💾', 'Respaldo y web'],
]
const VACIA = Object.fromEntries(BD.TABLAS.map((t) => [t, []]))

export default function Panel() {
  const [db, setDb] = useState(VACIA)
  const [cargado, setCargado] = useState(false)
  const [vista, setVista] = useState('tablero')
  const [form, setForm] = useState(null) // { tabla, registro }
  const [expediente, setExpediente] = useState(null) // id de animal
  const [aviso, setAviso] = useState('')
  const [persistente, setPersistente] = useState(null)
  const [menu, setMenu] = useState(false)
  const [importar, setImportar] = useState(false)

  const recargar = useCallback(async () => setDb(await BD.todo()), [])
  useEffect(() => {
    recargar().then(() => setCargado(true))
    BD.pedirPersistencia().then(setPersistente)
  }, [recargar])

  const avisar = (txt) => {
    setAviso(txt)
    setTimeout(() => setAviso(''), 2600)
  }

  const abrirNuevo = (tabla, base = {}) => setForm({ tabla, registro: { ...ESQUEMAS[tabla].nuevo(), ...base } })
  const abrirEditar = (tabla, registro) => setForm({ tabla, registro })

  async function guardar(r) {
    const { tabla } = form
    if (tabla === 'animales' && !r.id) r = { ...r, id: BD.idDeNombre(r.nombre, db.animales.map((a) => a.id)) }
    if (Array.isArray(r.personalidad)) r = { ...r, personalidad: r.personalidad.map((x) => x.trim()).filter(Boolean) }
    await BD.guardar(tabla, r)

    // Al registrar una adopción se actualizan el animal y la solicitud
    if (tabla === 'adopciones') {
      const an = db.animales.find((a) => a.id === r.animalId)
      const so = db.solicitudes.find((s) => s.id === r.solicitudId)
      if (an && an.estado !== 'adoptado') await BD.guardar('animales', { ...an, estado: 'adoptado' })
      if (so && so.estado !== 'aprobada') await BD.guardar('solicitudes', { ...so, estado: 'aprobada' })
    }
    await recargar()
    setForm(null)
    avisar('✓ Guardado')
  }

  async function borrar(r) {
    const { tabla } = form
    const usos = {
      animales: ['procedimientos', 'adopciones', 'solicitudes'].reduce((n, t) => n + db[t].filter((x) => x.animalId === r.id).length, 0),
      solicitudes: db.adopciones.filter((x) => x.solicitudId === r.id).length,
      adopciones: db.seguimientos.filter((x) => x.adopcionId === r.id).length,
    }[tabla]
    if (usos) {
      window.alert(`No se puede eliminar: tiene ${usos} registro(s) relacionados. Si ya no está en el albergue, cambia su estado en lugar de eliminarlo.`)
      return
    }
    await BD.borrar(tabla, r.id)
    await recargar()
    setForm(null)
    avisar('Registro eliminado')
  }

  if (!cargado) return <div className="cargando"><Huella className="cargando__huella" /><p>Abriendo base de datos…</p></div>

  const vacio = BD.TABLAS.every((t) => db[t].length === 0)

  return (
    <div className="panel">
      <aside className={`p-lateral ${menu ? 'abierto' : ''}`}>
        <div className="logo">
          <span className="logo__icono"><Huella /></span>
          <span className="logo__texto"><small>Panel de gestión</small>Albergue Mixco</span>
        </div>
        <button className="p-menu" onClick={() => setMenu(!menu)} aria-expanded={menu}>☰ Menú</button>
        <nav>
          {VISTAS.map(([v, ic, txt]) => (
            <button key={v} className={vista === v ? 'activo' : ''} onClick={() => { setVista(v); setMenu(false) }}>
              <span aria-hidden="true">{ic}</span> {txt}
              {v !== 'tablero' && v !== 'respaldo' && <small>{db[v].length}</small>}
            </button>
          ))}
        </nav>
        <a className="p-ver-web" href="./" target="_blank" rel="noopener noreferrer">Ver página pública ↗</a>
      </aside>

      <main className="p-contenido">
        <AvisoRespaldo persistente={persistente} onIr={() => setVista('respaldo')} vacio={vacio} />

        {vista === 'tablero' && (
          <Tablero db={db} vacio={vacio} onEjemplo={async () => { await BD.reemplazarTodo(datosDeEjemplo()); await recargar(); avisar('Datos de ejemplo cargados') }}
            onVerAnimal={setExpediente} onNuevo={abrirNuevo} onEditar={abrirEditar} onImportar={() => setImportar(true)} />
        )}
        {ESQUEMAS[vista] && (
          <>
            <h1 className="p-titulo">{ESQUEMAS[vista].icono} {ESQUEMAS[vista].titulo}</h1>
            {vista === 'solicitudes' && (
              <div className="p-wa">
                <span>💬 ¿Llegó una solicitud por WhatsApp?</span>
                <button className="btn btn--verde btn--sm" onClick={() => setImportar(true)}>Pegar mensaje de WhatsApp</button>
              </div>
            )}
            <Tabla
              key={vista}
              tabla={vista}
              db={db}
              onNuevo={() => abrirNuevo(vista)}
              onEditar={(r) => abrirEditar(vista, r)}
              onVer={vista === 'animales' ? (r) => setExpediente(r.id) : undefined}
            />
          </>
        )}
        {vista === 'respaldo' && <Respaldo db={db} recargar={recargar} avisar={avisar} />}
      </main>

      {expediente && (
        <Expediente
          animal={db.animales.find((a) => a.id === expediente)}
          db={db}
          onCerrar={() => setExpediente(null)}
          onNuevo={abrirNuevo}
          onEditar={abrirEditar}
        />
      )}
      {form && (
        <Formulario
          key={form.registro.id || 'nuevo'}
          tabla={form.tabla}
          registro={form.registro}
          db={db}
          onGuardar={guardar}
          onBorrar={borrar}
          onCerrar={() => setForm(null)}
        />
      )}
      {importar && (
        <ImportarWhatsapp
          animales={db.animales}
          onCerrar={() => setImportar(false)}
          onContinuar={(base) => { setImportar(false); abrirNuevo('solicitudes', base) }}
        />
      )}
      {aviso && <div className="p-toast" role="status">{aviso}</div>}
    </div>
  )
}

function AvisoRespaldo({ persistente, onIr, vacio }) {
  if (vacio) return null
  const ultimo = BD.ultimoRespaldo.leer()
  const dias = ultimo ? Math.floor((Date.now() - new Date(ultimo)) / 86400000) : null
  if (dias !== null && dias < 7) return null
  return (
    <div className="p-alerta">
      💾 {dias === null ? 'Todavía no has descargado ningún respaldo.' : `Tu último respaldo fue hace ${dias} días.`}{' '}
      Los datos viven solo en este navegador{persistente === false ? ' y el navegador podría borrarlos si falta espacio' : ''}.
      <button className="p-link" onClick={onIr}>Hacer respaldo ahora</button>
    </div>
  )
}

// ---------------- Importar solicitud desde WhatsApp ----------------
function ImportarWhatsapp({ animales, onCerrar, onContinuar }) {
  const [texto, setTexto] = useState('')
  const [telefono, setTelefono] = useState('')
  const leido = texto.trim() ? leerMensajeWhatsapp(texto, animales) : null

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onCerrar])

  const continuar = () => {
    const { animalNoEncontrado, ...datos } = leido
    onContinuar({
      ...datos,
      telefono,
      respuestas: datos.respuestas + (animalNoEncontrado ? `\n\n(Pidió a "${animalNoEncontrado}", que no está registrado en el panel)` : ''),
      estado: 'pendiente',
    })
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Pegar mensaje de WhatsApp" onClick={onCerrar}>
      <div className="modal__caja p-form" onClick={(e) => e.stopPropagation()}>
        <button className="modal__cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
        <h3>💬 Solicitud desde WhatsApp</h3>
        <ol className="p-pasos">
          <li>En WhatsApp, mantén presionado el mensaje de la persona y elige <strong>Copiar</strong>.</li>
          <li>Pégalo aquí abajo y escribe su número de teléfono.</li>
          <li>Revisa los datos y presiona <strong>Guardar</strong>.</li>
        </ol>
        <div className="p-campos">
          <div className="p-campo p-campo--ancho">
            <label htmlFor="wa-texto">Mensaje</label>
            <textarea id="wa-texto" rows="7" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="¡Hola! Soy … y quiero iniciar un proceso de adopción para …" autoFocus />
          </div>
          <div className="p-campo">
            <label htmlFor="wa-tel">Teléfono de la persona</label>
            <input id="wa-tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="0000-0000" />
          </div>
          {leido && (
            <div className="p-campo p-leido">
              <span>Detectado:</span>
              <small>👤 {leido.nombre || 'nombre no detectado'}</small>
              <small>🐾 {leido.animalId ? animales.find((a) => a.id === leido.animalId)?.nombre : leido.animalNoEncontrado ? `"${leido.animalNoEncontrado}" (no registrado)` : 'sin animal específico'}</small>
            </div>
          )}
          <div className="p-botones">
            <button type="button" className="btn btn--blanco btn--sm" onClick={onCerrar}>Cancelar</button>
            <button type="button" className="btn btn--rosa btn--sm" disabled={!leido} onClick={continuar}>Continuar →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------- Tablero ----------------
function Tablero({ db, vacio, onEjemplo, onVerAnimal, onNuevo, onEditar, onImportar }) {
  const anio = String(new Date().getFullYear())
  const enAlbergue = db.animales.filter((a) => EN_ALBERGUE.includes(a.estado))
  const proximos = proximosProcedimientos(db)
  const seguim = seguimientosPendientes(db)
  const porMes = adopcionesPorMes(db)
  const max = Math.max(1, ...porMes.map((m) => m.total))
  const pendientes = db.solicitudes.filter((s) => ['pendiente', 'en-revision'].includes(s.estado))

  const tarjetas = [
    ['🏠', 'En el albergue', enAlbergue.length],
    ['💚', 'Disponibles', db.animales.filter((a) => a.estado === 'disponible').length],
    ['🩹', 'En tratamiento', db.animales.filter((a) => a.estado === 'en-tratamiento').length],
    ['🎉', `Adopciones ${anio}`, db.adopciones.filter((a) => (a.fecha || '').startsWith(anio)).length],
    ['📝', 'Solicitudes por revisar', pendientes.length],
  ]

  return (
    <>
      <h1 className="p-titulo">📊 Tablero</h1>
      {vacio && (
        <div className="p-bienvenida">
          <h2>¡Bienvenidos al panel de gestión! 🐾</h2>
          <p>Aquí pueden llevar el registro de los animales que ingresan, sus vacunas y procedimientos, las personas que solicitan adoptar (aprobadas o no), las adopciones y su seguimiento.</p>
          <p><strong>Los datos se guardan solo en esta computadora</strong>, no en internet. Recuerden descargar un respaldo cada semana.</p>
          <div className="p-botones p-botones--izq">
            <button className="btn btn--rosa" onClick={() => onNuevo('animales')}>Registrar el primer animal</button>
            <button className="btn btn--blanco" onClick={onEjemplo}>Probar con datos de ejemplo</button>
          </div>
        </div>
      )}

      <div className="p-tarjetas">
        {tarjetas.map(([ic, txt, n]) => (
          <div key={txt} className="p-tarjeta"><span>{ic}</span><strong>{n}</strong><small>{txt}</small></div>
        ))}
      </div>

      <div className="p-columnas">
        <section className="p-caja">
          <h2>🩺 Vacunas y controles próximos</h2>
          {proximos.length === 0 ? <p className="p-vacio">Nada pendiente en los próximos 14 días.</p> : (
            <ul className="p-lista">
              {proximos.map((p) => (
                <li key={p.id} className={p.vencido ? 'vencido' : ''}>
                  <button className="p-link" onClick={() => onVerAnimal(p.animalId)}>{etiquetaDe('animales', p.animalId, db)}</button>
                  <span>{mostrar(ESQUEMAS.procedimientos.campos[2], p.tipo)}{p.detalle ? ` · ${p.detalle}` : ''}</span>
                  <b>{p.vencido ? 'Vencido ' : ''}{fechaBonita(p.proximaFecha)}</b>
                  <button className="p-link" onClick={() => onNuevo('procedimientos', { animalId: p.animalId, tipo: p.tipo })}>Registrar</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="p-caja">
          <h2>📞 Seguimientos pendientes</h2>
          {seguim.length === 0 ? <p className="p-vacio">Todas las familias tienen su seguimiento al día.</p> : (
            <ul className="p-lista">
              {seguim.map((s) => (
                <li key={s.adopcion.id + s.hito}>
                  <span>{etiquetaDe('adopciones', s.adopcion.id, db)}</span>
                  <b>Seguimiento de {s.hito}</b>
                  <button className="p-link" onClick={() => onNuevo('seguimientos', { adopcionId: s.adopcion.id })}>Registrar</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="p-caja">
          <div className="p-exp-titulo">
            <h2>📝 Solicitudes por revisar</h2>
            <button className="p-link" onClick={onImportar}>💬 Pegar de WhatsApp</button>
          </div>
          {pendientes.length === 0 ? <p className="p-vacio">No hay solicitudes pendientes.</p> : (
            <ul className="p-lista">
              {pendientes.map((s) => (
                <li key={s.id}>
                  <span>{s.nombre}{s.animalId ? ` → ${etiquetaDe('animales', s.animalId, db)}` : ''}</span>
                  <b>{fechaBonita(s.fecha)}</b>
                  <button className="p-link" onClick={() => onEditar('solicitudes', s)}>Revisar</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="p-caja">
          <h2>🏡 Adopciones por mes</h2>
          <div className="p-barras">
            {porMes.map((m) => (
              <div key={m.clave} className="p-barra-mes">
                <span className="p-barra-valor">{m.total}</span>
                <div style={{ height: `${(m.total / max) * 100}%` }} />
                <small>{m.etiqueta}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

// ---------------- Expediente de un animal ----------------
function Expediente({ animal, db, onCerrar, onNuevo, onEditar }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onCerrar])
  if (!animal) return null

  const procs = db.procedimientos.filter((p) => p.animalId === animal.id).sort((a, b) => b.fecha.localeCompare(a.fecha))
  const sols = db.solicitudes.filter((s) => s.animalId === animal.id)
  const adop = db.adopciones.find((a) => a.animalId === animal.id)
  const segs = adop ? db.seguimientos.filter((s) => s.adopcionId === adop.id) : []
  const campo = (k) => ESQUEMAS.animales.campos.find((c) => c.k === k)
  const tipoProc = ESQUEMAS.procedimientos.campos.find((c) => c.k === 'tipo')
  const diasAlbergue = animal.fechaIngreso ? Math.floor((new Date(hoyISO()) - new Date(animal.fechaIngreso)) / 86400000) : null

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={`Expediente de ${animal.nombre}`} onClick={onCerrar}>
      <div className="modal__caja p-expediente" onClick={(e) => e.stopPropagation()}>
        <button className="modal__cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
        <header className="p-exp-cab">
          <div className="p-exp-avatar"><AnimalIlustracion especie={animal.especie} color={animal.color} manchas={animal.manchas} /></div>
          <div>
            <h2>{animal.nombre}</h2>
            <span className={`p-estado p-estado--${animal.estado}`}>{ESTADOS_ANIMAL[animal.estado]}</span>
            {animal.publicar ? <span className="p-chip">🌐 Publicado</span> : <span className="p-chip p-chip--gris">No publicado</span>}
            <p>
              {mostrar(campo('especie'), animal.especie)} · {mostrar(campo('sexo'), animal.sexo) || 'Sexo sin registrar'} · {animal.edadAprox || 'edad sin registrar'}
              <br />Ingresó el {fechaBonita(animal.fechaIngreso)}{diasAlbergue !== null && animal.estado !== 'adoptado' ? ` (${diasAlbergue} días en el albergue)` : ''} · {mostrar(campo('procedencia'), animal.procedencia) || 'Procedencia sin registrar'}
            </p>
            <button className="btn btn--blanco btn--sm" onClick={() => onEditar('animales', animal)}>Editar datos</button>
          </div>
        </header>
        {animal.notas && <p className="p-notas">🗒️ {animal.notas}</p>}

        <section>
          <div className="p-exp-titulo">
            <h3>🩺 Historial veterinario</h3>
            <button className="btn btn--rosa btn--sm" onClick={() => onNuevo('procedimientos', { animalId: animal.id })}>+ Procedimiento</button>
          </div>
          {procs.length === 0 ? <p className="p-vacio">Sin procedimientos registrados.</p> : (
            <ol className="p-historial">
              {procs.map((p) => (
                <li key={p.id}>
                  <time>{fechaBonita(p.fecha)}</time>
                  <strong>{mostrar(tipoProc, p.tipo)}</strong> {p.detalle}
                  {p.responsable && <small> · {p.responsable}</small>}
                  {p.proximaFecha && <small className="p-prox"> · Próxima: {fechaBonita(p.proximaFecha)}</small>}
                  <button className="p-link" onClick={() => onEditar('procedimientos', p)}>Editar</button>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <div className="p-exp-titulo">
            <h3>📝 Solicitudes de adopción</h3>
            <button className="btn btn--blanco btn--sm" onClick={() => onNuevo('solicitudes', { animalId: animal.id })}>+ Solicitud</button>
          </div>
          {sols.length === 0 ? <p className="p-vacio">Nadie ha solicitado a {animal.nombre} todavía.</p> : (
            <ul className="p-lista">
              {sols.map((s) => (
                <li key={s.id}>
                  <span>{s.nombre}</span>
                  <span className={`p-estado p-estado--${s.estado}`}>{mostrar(ESQUEMAS.solicitudes.campos.find((c) => c.k === 'estado'), s.estado)}</span>
                  <button className="p-link" onClick={() => onEditar('solicitudes', s)}>Ver</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="p-exp-titulo">
            <h3>🏡 Adopción</h3>
            {!adop && <button className="btn btn--blanco btn--sm" onClick={() => onNuevo('adopciones', { animalId: animal.id })}>Registrar adopción</button>}
          </div>
          {!adop ? <p className="p-vacio">Aún no ha sido adoptado.</p> : (
            <>
              <p>Adoptado por <strong>{etiquetaDe('solicitudes', adop.solicitudId, db)}</strong> el {fechaBonita(adop.fecha)}{adop.folio ? ` · Folio ${adop.folio}` : ''}.</p>
              <ul className="p-lista">
                {segs.map((s) => (
                  <li key={s.id}><b>{fechaBonita(s.fecha)}</b><span>{mostrar(ESQUEMAS.seguimientos.campos[3], s.resultado)} {s.notas}</span></li>
                ))}
              </ul>
              <button className="btn btn--blanco btn--sm" onClick={() => onNuevo('seguimientos', { adopcionId: adop.id })}>+ Seguimiento</button>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

// ---------------- Respaldo y publicación ----------------
function Respaldo({ db, recargar, avisar }) {
  const fecha = hoyISO()
  const publicos = animalesPublicos(db)

  const respaldar = () => {
    descargar(`respaldo-albergue-${fecha}.json`, JSON.stringify({ app: 'albergue-mixco-gestion', version: 1, fecha: new Date().toISOString(), datos: db }, null, 2), 'application/json')
    BD.ultimoRespaldo.marcar()
    avisar('Respaldo descargado')
  }

  const restaurar = async (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    try {
      const json = JSON.parse(await archivo.text())
      if (json.app !== 'albergue-mixco-gestion' || !json.datos) throw new Error('El archivo no es un respaldo de este panel.')
      const total = BD.TABLAS.reduce((n, t) => n + (json.datos[t]?.length || 0), 0)
      if (!window.confirm(`Se reemplazarán TODOS los datos actuales por el respaldo del ${new Date(json.fecha).toLocaleString('es-GT')} (${total} registros). ¿Continuar?`)) return
      await BD.reemplazarTodo(json.datos)
      await recargar()
      avisar('Respaldo restaurado')
    } catch (err) {
      window.alert(`No se pudo restaurar: ${err.message}`)
    }
  }

  const borrarTodo = async () => {
    if (!window.confirm('¿Borrar TODOS los datos del panel en este navegador? Descarga un respaldo antes si lo necesitas.')) return
    if (window.prompt('Para confirmar escribe BORRAR') !== 'BORRAR') return
    await BD.reemplazarTodo({})
    await recargar()
    avisar('Datos borrados')
  }

  return (
    <>
      <h1 className="p-titulo">💾 Respaldo y web</h1>
      <div className="p-columnas">
        <section className="p-caja">
          <h2>Respaldo de seguridad</h2>
          <p>Descarga un archivo con <strong>toda</strong> la información. Guárdenlo en una USB o en el Drive del albergue. Si cambian de computadora, lo restauran aquí.</p>
          <div className="p-botones p-botones--izq">
            <button className="btn btn--rosa" onClick={respaldar}>Descargar respaldo</button>
            <label className="btn btn--blanco">
              Restaurar respaldo
              <input type="file" accept="application/json,.json" onChange={restaurar} hidden />
            </label>
          </div>
          <p className="p-ayuda">⚠️ El respaldo contiene datos personales (DPI, teléfonos). No lo compartan por redes ni lo suban a la página web.</p>
        </section>

        <section className="p-caja">
          <h2>🌐 Publicar en la página web</h2>
          <p>Genera la lista pública de animales <strong>sin datos privados</strong>. La salud (vacunas, desparasitación, esterilización) se toma del historial veterinario.</p>
          <p><strong>{publicos.length}</strong> animales marcados para publicar.</p>
          <div className="p-botones p-botones--izq">
            <button className="btn btn--verde" onClick={() => descargar('animales.json', jsonPublico(db), 'application/json')}>Descargar animales.json</button>
            <button className="btn btn--blanco" onClick={() => descargar('animales.csv', csvPublico(db), 'text/csv')}>CSV para Google Sheets</button>
          </div>
          <p className="p-ayuda">Reemplacen <code>datos/animales.json</code> en el sitio publicado, o peguen el CSV en la hoja “animales” si usan Google Sheets.</p>
        </section>

        <section className="p-caja">
          <h2>📑 Exportar a Excel</h2>
          <p>Descarga cada tabla como archivo CSV (se abre con Excel o Google Sheets) para informes o para la Municipalidad.</p>
          <div className="p-botones p-botones--izq p-botones--envolver">
            {BD.TABLAS.map((t) => (
              <button key={t} className="btn btn--blanco btn--sm" onClick={() => descargar(`${t}-${fecha}.csv`, csvTabla(t, db), 'text/csv')}>
                {ESQUEMAS[t].icono} {ESQUEMAS[t].titulo}
              </button>
            ))}
          </div>
        </section>

        <section className="p-caja">
          <h2>🧪 Datos de prueba</h2>
          <p>Útil para capacitar al personal. Recuerden borrar los datos de ejemplo antes de empezar a registrar datos reales.</p>
          <div className="p-botones p-botones--izq">
            <button className="btn btn--blanco btn--sm" onClick={async () => {
              if (!window.confirm('Esto reemplaza los datos actuales por datos de ejemplo. ¿Continuar?')) return
              await BD.reemplazarTodo(datosDeEjemplo()); await recargar(); avisar('Datos de ejemplo cargados')
            }}>Cargar datos de ejemplo</button>
            <button className="btn btn--sm p-borrar" onClick={borrarTodo}>Borrar todos los datos</button>
          </div>
        </section>
      </div>
    </>
  )
}
