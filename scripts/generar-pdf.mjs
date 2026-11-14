// Genera los PDF de la documentación (docs/pdf/) a partir de los archivos .md
// Uso:  npm run docs:pdf
// Requiere Microsoft Edge o Google Chrome instalado y conexión a internet
// (para las fuentes y los diagramas).
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { Marked } from 'marked'

const DOCUMENTOS = [
  { md: 'docs/ENTREGA.md', pdf: 'Acta-de-entrega.pdf', titulo: 'Acta de entrega', subtitulo: 'Resumen de lo entregado, estado y próximos pasos', portada: false },
  { md: 'docs/GUIA_DE_USUARIO.md', pdf: 'Guia-de-usuario.pdf', titulo: 'Guía de usuario', subtitulo: 'Para el personal del albergue: cambiar la información y usar el Panel de gestión', portada: true },
  {
    md: 'docs/README_TECNICO.md', pdf: 'README-tecnico.pdf', titulo: 'README técnico', subtitulo: 'Instalación, publicación, mantenimiento, base de datos y conexión con WhatsApp', portada: true,
    anexos: [{ titulo: 'Anexo A — Propuesta de base de datos (esquema.sql)', archivo: 'docs/base-de-datos/esquema.sql', lenguaje: 'sql' }],
  },
]
const EQUIPO = ['Lizbeth Andrea Herrera Ortega', 'Marcela Nicole Letran Lee', 'Ian Andrés Ponce Valdizón']
const VERSION = JSON.parse(fs.readFileSync('package.json', 'utf8')).version
const FECHA = new Date().toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' })

// ---------- Navegador ----------
const NAVEGADORES = [
  process.env.NAVEGADOR_PDF,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].filter(Boolean)
const navegador = NAVEGADORES.find((r) => fs.existsSync(r))
if (!navegador) {
  console.error('✗ No se encontró Edge ni Chrome. Indiquen la ruta con la variable NAVEGADOR_PDF.')
  process.exit(1)
}

// ---------- Markdown → HTML ----------
// Ids de títulos iguales a los de GitHub, para que funcionen los enlaces del índice
const slug = (t) => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s/g, '-')
const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function convertir(md) {
  const marked = new Marked({ gfm: true })
  marked.use({
    renderer: {
      heading({ tokens, depth, text }) {
        return `<h${depth} id="${slug(text)}">${this.parser.parseInline(tokens)}</h${depth}>\n`
      },
      code({ text, lang }) {
        if (lang === 'mermaid') return `<div class="diagrama"><pre class="mermaid">${escapar(text)}</pre></div>`
        return `<pre><code>${escapar(text)}</code></pre>`
      },
      // En el PDF, los enlaces a archivos del repositorio se muestran como nombre de archivo
      link({ href, tokens }) {
        const texto = this.parser.parseInline(tokens)
        if (/^(https?:|mailto:|#)/.test(href)) return `<a href="${href}">${texto}</a>`
        return `<span class="archivo">${texto}</span>`
      },
    },
  })
  return marked.parse(md)
}

const HUELLA = `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><ellipse cx="32" cy="42" rx="14" ry="12"/><ellipse cx="14" cy="26" rx="6" ry="8"/><ellipse cx="26" cy="15" rx="6" ry="8"/><ellipse cx="38" cy="15" rx="6" ry="8"/><ellipse cx="50" cy="26" rx="6" ry="8"/></g></svg>`

function pagina(doc, cuerpo) {
  const portada = doc.portada
    ? `<section class="portada">
        <div class="portada__huella">${HUELLA}</div>
        <p class="portada__albergue">Albergue Municipal de Mascotas Mixco</p>
        <h1 class="portada__titulo">${doc.titulo}</h1>
        <p class="portada__sub">${doc.subtitulo}</p>
        <div class="portada__pie">
          <p><strong>Sitio web y Panel de gestión</strong> · versión ${VERSION} · ${FECHA}</p>
          <p>Elaborado por: ${EQUIPO.join(' · ')}</p>
          <p>Universidad Rafael Landívar — Ética Aplicada, Sección 24 · Proyecto de Aprendizaje y Servicio</p>
        </div>
      </section>`
    : ''
  const anexos = (doc.anexos || [])
    .map((a) => `<section class="anexo"><h1 id="${slug(a.titulo)}">${a.titulo}</h1><pre class="anexo__codigo"><code>${escapar(fs.readFileSync(a.archivo, 'utf8'))}</code></pre></section>`)
    .join('')

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${doc.titulo} · Albergue Mixco</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Nunito:wght@400;700;800&display=swap" rel="stylesheet">
<style>
  @page { size: letter; margin: 18mm 17mm 20mm;
    @bottom-left { content: "Albergue Municipal de Mascotas Mixco · ${doc.titulo}"; font: 8pt Nunito, sans-serif; color: #6b7f79; }
    @bottom-right { content: "Página " counter(page) " de " counter(pages); font: 8pt Nunito, sans-serif; color: #6b7f79; } }
  @page :first { ${doc.portada ? 'margin: 0; @bottom-left { content: none } @bottom-right { content: none }' : ''} }
  :root { --verde: #163832; --verde-medio: #235347; --menta: #daf1de; --rosa: #e8559a; --lila: #7c5fd3; --texto: #17302b; --suave: #4c6660; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: Nunito, "Segoe UI", sans-serif; font-size: 10.5pt; line-height: 1.5; color: var(--texto); margin: 0; }
  h1, h2, h3, h4 { font-family: "Baloo 2", Nunito, sans-serif; color: var(--verde); line-height: 1.2; break-after: avoid; }
  h1 { font-size: 22pt; margin: 0 0 8pt; }
  h2 { font-size: 15pt; margin: 20pt 0 6pt; padding-bottom: 3pt; border-bottom: 2.5pt solid var(--menta); break-before: auto; }
  h3 { font-size: 12pt; margin: 14pt 0 4pt; color: var(--verde-medio); }
  p, li { orphans: 3; widows: 3; }
  a { color: #c23a7e; text-decoration: none; }
  hr { border: 0; border-top: 1pt dashed #b9d8c1; margin: 14pt 0; }
  blockquote { margin: 8pt 0; padding: 6pt 10pt; background: #fdf1d2; border-left: 4pt solid #e9b949; border-radius: 4pt; break-inside: avoid; }
  blockquote p { margin: 2pt 0; }
  code { font-family: Consolas, "Cascadia Mono", monospace; font-size: 9pt; background: #eef6f0; padding: 0 3pt; border-radius: 3pt; }
  pre { background: #0b2b26; color: #daf1de; padding: 8pt 10pt; border-radius: 6pt; white-space: pre-wrap; word-break: break-word; break-inside: avoid; font-size: 8.5pt; }
  pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
  .archivo { font-family: Consolas, monospace; font-size: 9pt; color: var(--verde-medio); }
  table { width: 100%; border-collapse: collapse; margin: 6pt 0 10pt; font-size: 9.3pt; break-inside: auto; }
  tr { break-inside: avoid; }
  th { background: var(--menta); color: var(--verde); text-align: left; padding: 4pt 6pt; }
  td { border-bottom: .6pt solid #dbe8df; padding: 4pt 6pt; vertical-align: top; }
  ul, ol { padding-left: 16pt; }
  li { margin: 1.5pt 0; }
  li input[type=checkbox] { margin-right: 4pt; }
  .diagrama { break-inside: avoid; text-align: center; margin: 8pt 0; }
  .diagrama pre.mermaid { background: none; color: inherit; padding: 0; }
  .diagrama svg { max-width: 100%; height: auto; }
  .firma { break-inside: avoid; margin-top: 10pt; }
  .firma p { display: flex; gap: 6pt; margin: 0 0 16pt; white-space: nowrap; }
  .firma span { flex: 1; border-bottom: .8pt solid #6b7f79; }
  table:has(thead th:empty) thead { display: none; }
  .portada { height: 240mm; display: flex; flex-direction: column; justify-content: center; break-after: page;
    background: linear-gradient(160deg, #efe9fc 0%, #e3f1ea 55%, #daf1de 100%); width: 215.9mm; height: 279.4mm; margin: 0; padding: 0 24mm; position: relative; overflow: hidden; }
  .portada__huella { width: 64pt; height: 64pt; border-radius: 50%; background: var(--rosa); color: #fff; display: grid; place-items: center; transform: rotate(-15deg); margin-bottom: 18pt; }
  .portada__huella svg { width: 36pt; }
  .portada__albergue { font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #c23a7e; font-size: 10pt; margin: 0; }
  .portada__titulo { font-size: 44pt; margin: 4pt 0 6pt; }
  .portada__sub { font-size: 14pt; color: var(--suave); max-width: 120mm; margin: 0; }
  .portada__pie { position: absolute; bottom: 22mm; left: 22mm; right: 22mm; font-size: 9pt; color: var(--suave); border-top: 1.5pt solid #b9d8c1; padding-top: 8pt; }
  .portada__pie p { margin: 2pt 0; }
  .anexo { break-before: page; }
  .anexo__codigo { break-inside: auto; font-size: 7.6pt; }
</style></head>
<body>${portada}<main>${cuerpo}</main>${anexos}
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs'
  mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: { primaryColor: '#daf1de', primaryBorderColor: '#235347', primaryTextColor: '#163832', lineColor: '#235347', fontFamily: 'Nunito, sans-serif' } })
  try { await document.fonts.ready; await mermaid.run({ querySelector: 'pre.mermaid' }) } finally { document.body.dataset.listo = '1' }
</script>
</body></html>`
}

// ---------- Generar ----------
const salida = path.resolve('docs/pdf')
const temporal = path.resolve('docs/pdf/.html')
fs.mkdirSync(temporal, { recursive: true })

for (const doc of DOCUMENTOS) {
  const html = pagina(doc, convertir(fs.readFileSync(doc.md, 'utf8')))
  const archivoHtml = path.join(temporal, doc.pdf.replace(/\.pdf$/, '.html'))
  fs.writeFileSync(archivoHtml, html)
  const pdf = path.join(salida, doc.pdf)
  execFileSync(navegador, [
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=20000', `--print-to-pdf=${pdf}`, pathToFileURL(archivoHtml).href,
  ], { stdio: 'ignore', timeout: 120000 })
  console.log(`✓ docs/pdf/${doc.pdf}  (${Math.round(fs.statSync(pdf).size / 1024)} KB)`)
}
fs.rmSync(temporal, { recursive: true, force: true })
