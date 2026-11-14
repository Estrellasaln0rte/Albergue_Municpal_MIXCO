# Guía de usuario — Página web y Panel del Albergue

Esta guía es para el **personal del albergue**. No hace falta saber programar: todo se cambia editando textos.

> 📌 Si algo no funciona después de un cambio, casi siempre es una **coma o una comilla**. Ve a [Problemas comunes](#9-problemas-comunes).

**Contenido**
1. [¿Qué hay en este proyecto?](#1-qué-hay-en-este-proyecto)
2. [Las 5 reglas para editar sin romper nada](#2-las-5-reglas-para-editar-sin-romper-nada)
3. [Datos del albergue (contacto, sede, cuentas…)](#3-datos-del-albergue)
4. [Los peluditos](#4-los-peluditos)
5. [Avisos, diario y necesidades](#5-avisos-diario-y-necesidades)
6. [Revisar y publicar los cambios](#6-revisar-y-publicar-los-cambios)
7. [Opción fácil: editar desde Google Sheets](#7-opción-fácil-editar-desde-google-sheets)
8. [Panel de gestión (registro interno)](#8-panel-de-gestión-registro-interno)
9. [Problemas comunes](#9-problemas-comunes)

---

## 1. ¿Qué hay en este proyecto?

| Parte | Para quién | Dónde se cambia |
|---|---|---|
| **Página web** | El público: adoptantes, donantes, voluntarios | Archivos de la carpeta `public/datos/` (o una hoja de Google Sheets) |
| **Panel de gestión** | Solo el personal | Se usa desde el navegador: `su-sitio/admin.html` |

Archivos que van a editar:

| Archivo | Qué cambia en la página |
|---|---|
| `public/datos/albergue.json` | Nombre, logo, teléfono, WhatsApp, correo, redes, dirección, horarios, historia, requisitos de adopción, cuestionario, cuentas para donar, transparencia |
| `public/datos/animales.json` | Los perros y gatos que aparecen en “Nuestros peluditos” |
| `public/datos/publicaciones.json` | Avisos (jornadas, campañas), diario del albergue y necesidades urgentes |
| `public/fotos/` | Carpeta donde se guardan las fotos |

**¿Con qué se abren?** Con cualquier editor de texto. Recomendamos **Visual Studio Code** (gratis): avisa en rojo si falta una coma. También sirve el Bloc de notas.

---

## 2. Las 5 reglas para editar sin romper nada

Los archivos `.json` tienen este aspecto:

```json
"contacto": {
  "telefono": "4630-2368",
  "correo": "albergue@ejemplo.com"
},
```

1. **Solo cambia lo que está entre comillas a la derecha** de los dos puntos. Lo de la izquierda (`"telefono"`) no se toca.
2. **Las comillas siempre en pareja:** `"4630-2368"` ✅  ·  `"4630-2368` ❌
3. **Coma entre elementos, pero no después del último:**
   ```json
   "uno": "a",
   "dos": "b"      ← el último NO lleva coma
   ```
4. Para escribir comillas dentro de un texto usa comillas tipográficas “así” o una barra: `\"`.
5. `true` / `false` van **sin comillas** (significan sí / no).

> 💡 Antes de editar, **haz una copia** del archivo (por ejemplo `albergue - copia.json`). Si algo sale mal, la vuelves a poner.

---

## 3. Datos del albergue

Todo esto está en **`public/datos/albergue.json`**. Busca la palabra **PENDIENTE**: son los datos de ejemplo que hay que reemplazar.

### Teléfono, WhatsApp y correo
```json
"contacto": {
  "telefono": "4630-2368",
  "whatsapp": "50246302368",
  "whatsappTexto": "4630-2368",
  "correo": "albergue@ejemplo.com",
  "mensajeWhatsapp": "¡Hola! Vengo de la página web del Albergue y quisiera información."
}
```
- `whatsapp`: **502 + los 8 dígitos, todo junto**, sin espacios, guiones ni “+”. Este número lo usan **todos** los botones de WhatsApp de la página.
- `whatsappTexto`: cómo se ve el número escrito en la página.
- `mensajeWhatsapp`: el mensaje que aparece escrito cuando alguien toca el botón verde flotante.

### Nombre y logo
```json
"logo": { "linea1": "Albergue Municipal", "linea2": "Mascotas Mixco", "imagen": "" }
```
Para usar el logo oficial: guarda la imagen en `public/fotos/logo.png` y escribe `"imagen": "fotos/logo.png"`.

### Redes sociales
```json
"redes": [
  { "red": "facebook",  "nombre": "Facebook",  "url": "https://www.facebook.com/..." },
  { "red": "instagram", "nombre": "Instagram", "url": "https://www.instagram.com/..." },
  { "red": "tiktok",    "nombre": "TikTok",    "url": "https://www.tiktok.com/@..." }
]
```
`red` puede ser: `facebook`, `instagram`, `tiktok`, `youtube`, `x`, `whatsapp`.

### Dirección, horarios y mapa
En `"sede"` cambia `direccion`, `referencia`, `horarios` y `servicios`.

**Para el mapa:**
1. Busca el albergue en Google Maps → **Compartir** → **Insertar un mapa** → copia solo lo que está dentro de `src="..."`.
2. Pégalo en `"mapaEmbed"`.
3. En Google Maps → **Compartir** → **Copiar vínculo** → pégalo en `"mapaLink"` (lo usa el botón “Cómo llegar”).

### Historia, misión y visión
En `"historia"`: `intro`, `mision`, `vision` y los `hitos` (año, título y texto de cada momento importante). Puedes agregar o quitar hitos copiando un bloque `{ ... }`.

### Adopción: pasos, requisitos y cuestionario
En `"adopcion"`:
- `pasos` y `requisitos`: lo que se muestra en “¿Cómo adopto?”.
- `cuestionario.preguntas`: las preguntas del cuestionario previo. Hay dos tipos:
  ```json
  { "id": "vivienda", "pregunta": "¿Dónde vives?", "tipo": "opciones", "opciones": ["Casa con patio", "Apartamento"] },
  { "id": "porque", "pregunta": "¿Por qué quieres adoptar?", "tipo": "texto" }
  ```
  Agrega `"opcional": true` si no es obligatoria. El `id` debe ser único y sin espacios.
- `cuestionario.formularioExterno`: si crean un Google Form oficial, pongan aquí su enlace.

### Donaciones
En `"donaciones"`:
- `cuentas`: banco, tipo, número y nombre. Puedes poner varias. El botón **Copiar** copia el número.
- `enlacePago`: si usan una plataforma de pagos **verificada** (por ejemplo, un link de pago del banco), pongan `"activo": true` y el enlace en `"url"`. La página **nunca** pide datos de tarjeta.
- `insumos`: lo que se puede donar en especie (icono, nombre, detalle).
- `voluntariado`: el texto de la sección de voluntariado.
- `transparencia`: cifras del mes. Actualícenlas cada mes:
  ```json
  "transparencia": {
    "periodo": "Diciembre 2026",
    "nota": "Gracias a todos los que donaron este mes.",
    "items": [
      { "texto": "Alimento recibido", "valor": 420, "meta": 500, "unidad": "lb" },
      { "texto": "Adopciones del mes", "valor": 14, "unidad": "" }
    ]
  }
  ```
  `meta` es opcional: si la pones, aparece una barra de avance.

---

## 4. Los peluditos

Archivo: **`public/datos/animales.json`**.

### Agregar un animal
Copia un bloque completo (desde `{` hasta `},`) y cambia los datos:

```json
{
  "id": "manchitas",
  "nombre": "Manchitas",
  "especie": "perro",
  "sexo": "hembra",
  "edad": "2 años",
  "tamano": "mediano",
  "estado": "disponible",
  "color": "#E3A35A",
  "foto": "fotos/manchitas.jpg",
  "personalidad": ["tranquila", "cariñosa"],
  "salud": { "vacunas": true, "desparasitado": true, "esterilizado": false },
  "historia": "La encontraron cerca del mercado. Es muy dulce con los niños.",
  "idealPara": "Familias con niños grandes."
},
```

| Campo | Valores permitidos |
|---|---|
| `id` | Único, en minúsculas, sin tildes ni espacios (usa guiones: `don-gato`). Es el enlace de su ficha: `su-sitio/#/peludito/manchitas` |
| `especie` | `perro` o `gato` |
| `sexo` | `macho` o `hembra` |
| `tamano` | `pequeño`, `mediano` o `grande` |
| `estado` | `disponible`, `en-proceso` o `adoptado` |
| `color` / `manchas` | Solo se usan si no hay foto (para la ilustración) |
| `foto` | Ruta dentro de `public/` (ej. `fotos/manchitas.jpg`). Vacío `""` = ilustración |

> 💡 También pueden registrar los animales en el **Panel de gestión** y descargar el `animales.json` ya listo (ver [sección 8](#8-panel-de-gestión-registro-interno)).

### Fotos
- Guárdalas en `public/fotos/`, sin espacios ni tildes en el nombre: `manchitas.jpg` ✅  `Foto Manchitas Nueva.JPG` ❌
- Que pesen **menos de 300 KB** (puedes reducirlas gratis en https://squoosh.app). Las fotos pesadas hacen lenta la página en celulares.
- Formato cuadrado o casi cuadrado se ve mejor.
- Usa solo fotos propias o autorizadas.

### Cuando un animal es adoptado 🎉
Cambia `"estado": "adoptado"` y, si la familia lo autoriza, agrega su final feliz:
```json
"finalFeliz": { "fecha": "2026-12-01", "texto": "Ahora vive con dos niños que lo adoran.", "foto": "fotos/manchitas-casa.jpg" }
```
Aparecerá en la sección **Finales felices**. Sin `finalFeliz`, solo se ve con el interruptor “Ver finales felices”.

### Compartir un animal en redes
En su ficha, toca **Compartir**. El enlace abre la página directamente en ese animal.

---

## 5. Avisos, diario y necesidades

Archivo: **`public/datos/publicaciones.json`**. Las fechas se escriben **año-mes-día**: `2026-12-24`.

### Avisos (jornadas, campañas, horarios especiales)
```json
{
  "id": "vacunacion-diciembre",
  "tipo": "vacunacion",
  "titulo": "Jornada de Vacunación",
  "fechaInicio": "2026-12-05",
  "fechaFin": "2026-12-05",
  "horario": "9:00 a 13:00",
  "lugar": "Parque central de Mixco",
  "descripcion": "Para perros y gatos. Traer carné si tienen.",
  "imagen": "",
  "destacado": true
}
```
- `tipo`: `adopcion`, `vacunacion`, `esterilizacion`, `campana` o `aviso`.
- El aviso **desaparece solo** al día siguiente de su `fechaFin`. No hace falta borrarlo.
- `destacado: true` lo muestra además en la barra verde de arriba de la página (usen solo uno a la vez).
- `imagen`: opcional, por ejemplo el afiche de la jornada (`fotos/afiche-vacunacion.jpg`).

### Diario del albergue
```json
{ "id": "a5", "fecha": "2026-12-02", "titulo": "Día de sol", "texto": "Todos salieron al patio.", "animales": ["canela", "bruno"], "foto": "", "emoji": "☀️" }
```
En `animales` van los `id` de los animales que aparecen. Al tocarlos, se abre su ficha.

### Necesidades urgentes
```json
"necesidades": [
  { "nombre": "Arena para gatos", "prioridad": "alta", "detalle": "Se termina esta semana" }
]
```
`prioridad`: `alta` (🔴 Urgente), `media` (🟡 Pronto) o `baja` (🟢 Siempre útil). El botón “Yo lo dono” abre WhatsApp con el producto ya escrito. Si la lista queda vacía (`[]`), la sección no aparece.

---

## 6. Revisar y publicar los cambios

### Revisar
La persona encargada de la parte técnica ejecuta:
```
npm run verificar
```
Muestra **✗ errores** (algo que rompe la página, por ejemplo una coma) y **⚠ datos de ejemplo** que faltan cambiar, con el archivo y el lugar exacto.

### Publicar
Depende de cómo se haya publicado la página (ver el README técnico). Las dos formas más comunes:
- **Si está en Netlify con GitHub:** editen el archivo en la página de GitHub (ícono del lápiz ✏️ → *Commit changes*). En 1 o 2 minutos el cambio está en línea.
- **Si se publicó arrastrando la carpeta:** reemplacen el archivo dentro de `dist/datos/` y vuelvan a arrastrar la carpeta `dist` a Netlify.

---

## 7. Opción fácil: editar desde Google Sheets

Si prefieren una hoja de cálculo en lugar de archivos, la página puede leer **animales, avisos, diario y necesidades** directamente de Google Sheets. Los cambios se ven en la página **en unos minutos, sin publicar nada**.

1. Pidan a la persona técnica que haga la configuración inicial (README técnico → Google Sheets).
2. Después, solo editen la hoja como cualquier Excel:
   - Una fila = un animal / aviso.
   - Listas separadas por comas: `juguetona, cariñosa`.
   - Sí/No: escriban `sí` o `no`.
   - Fechas: `2026-12-05` o `05/12/2026`.

> 🔒 Esa hoja es **pública**. Nunca pongan en ella DPI, teléfonos ni direcciones de personas.

---

## 8. Panel de gestión (registro interno)

Se abre en **`su-sitio/admin.html`** (también hay un enlace “🔒 Panel del albergue” al final de la página). Sirve para llevar el control interno.

> 🔐 **Muy importante:** los datos del panel se guardan **solo en la computadora y el navegador donde se usa**. No están en internet.
> - Usen siempre **la misma computadora y el mismo navegador** (por ejemplo, Chrome en la computadora de la oficina).
> - Descarguen un **respaldo cada semana** (💾 Respaldo y web → *Descargar respaldo*) y guárdenlo en una USB o en el Drive del albergue.
> - Si borran el historial / datos del navegador, **se borran los registros**. El respaldo los recupera.

### Primer uso
En el Tablero pueden tocar **“Probar con datos de ejemplo”** para practicar. Cuando estén listos: 💾 Respaldo y web → **Borrar todos los datos** y empiecen con los reales.

### Tareas del día a día

| Quiero… | Dónde | Cómo |
|---|---|---|
| Registrar un animal que ingresó | 🐾 Animales | **+ Agregar animal**. Estado “En tratamiento” mientras se recupera |
| Anotar una vacuna o procedimiento | 🐾 Animales → **Expediente** | **+ Procedimiento**. Si tiene refuerzo, llenen “Próxima dosis” y el Tablero les avisará |
| Ver qué vacunas tocan esta semana | 📊 Tablero | “Vacunas y controles próximos” (en rojo las vencidas) → **Registrar** |
| Registrar una solicitud que llegó por WhatsApp | 📝 Solicitudes | **Pegar mensaje de WhatsApp**: copien el mensaje en WhatsApp (mantener presionado → Copiar), péguenlo, escriban el teléfono y **Guardar**. El nombre, el animal y las respuestas se llenan solos |
| Evaluar una solicitud | 📝 Solicitudes → **Editar** | Cambien el estado a *En revisión*, *Aprobada* o *No aprobada* y escriban el **motivo** |
| Registrar una adopción | 🐾 Expediente → **Registrar adopción** | Elijan la solicitud aprobada. El animal pasa a *Adoptado* automáticamente |
| Hacer el seguimiento (1 mes / 6 meses) | 📊 Tablero → “Seguimientos pendientes” | **Registrar**: llamada o visita, resultado y notas |
| Actualizar los animales de la página | 💾 Respaldo y web | **Descargar animales.json** y reemplazar el de la página. Solo salen los animales con “Mostrar en la página web” ✔, **sin datos privados**. La salud se toma de sus procedimientos |
| Hacer un informe para la Municipalidad | 💾 Respaldo y web → Exportar a Excel | Descarga cada tabla en un archivo que abre Excel |

### Privacidad
- Las **notas internas**, la procedencia, el DPI y los datos de los solicitantes **nunca** salen a la página.
- No compartan el archivo de respaldo por redes sociales ni WhatsApp: contiene datos personales.
- Si una persona pide que borren sus datos, búsquenla en Solicitudes → **Editar** → **Eliminar** (si ya adoptó, el panel no deja borrarla para no perder el historial del animal; en ese caso borren solo su DPI, teléfono y dirección).

---

## 9. Problemas comunes

| Lo que pasa | Causa probable | Solución |
|---|---|---|
| La página dice “😿 No se pudo leer…” o “Revisa que los archivos… tengan formato JSON válido” | Falta o sobra una coma o comilla | Ejecuten `npm run verificar`: indica el archivo y la línea. O peguen el archivo en https://jsonlint.com |
| El botón de WhatsApp abre “número no válido” | `whatsapp` mal escrito | Debe ser `502` + 8 dígitos, todo junto: `50246302368` |
| No aparece la foto | Nombre del archivo distinto al del JSON (mayúsculas cuentan) | `fotos/Canela.JPG` ≠ `fotos/canela.jpg` |
| Un aviso no aparece | Su `fechaFin` ya pasó, o la fecha está en otro formato | Usar `AAAA-MM-DD` |
| Un animal no aparece | `estado` mal escrito | Solo `disponible`, `en-proceso` o `adoptado` |
| El panel aparece vacío | Lo abrieron en otra computadora o navegador, o se borraron los datos del navegador | 💾 Respaldo y web → **Restaurar respaldo** |
| El panel dice “No se puede eliminar” | El registro tiene otros registros relacionados | Cambien el estado (por ejemplo, *Transferido*) en lugar de eliminar |
