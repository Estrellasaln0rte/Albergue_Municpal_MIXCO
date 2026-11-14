# 🐾 Albergue Municipal de Mascotas Mixco — Sitio web y Panel de gestión

Plantilla lista para usar: el albergue **solo cambia datos**, no necesita programar.

| | |
|---|---|
| 🌐 **Página pública** (`index.html`) | Adopción con ficha y enlace propio por animal, avisos y jornadas, diario del albergue, finales felices, cuestionario de adopción, donaciones con transparencia y necesidades urgentes, historia, sede y contacto. Todos los botones abren WhatsApp con el mensaje ya escrito. |
| 🔒 **Panel de gestión** (`admin.html`) | Registro interno: animales y expedientes, vacunas y procedimientos con recordatorios, solicitudes de adopción (aprobadas o no) importables desde WhatsApp, adopciones, seguimientos, respaldos, exportación a Excel y generación de los datos públicos. |

> ⚠️ Todos los datos son **de ejemplo o ficticios**. `npm run verificar` lista lo que falta cambiar.

## 📚 Documentación

**En PDF** (para imprimir o archivar), en [`docs/pdf/`](docs/pdf/):
- [Acta de entrega](docs/pdf/Acta-de-entrega.pdf) · [Guía de usuario](docs/pdf/Guia-de-usuario.pdf) · [README técnico](docs/pdf/README-tecnico.pdf)

**En línea:**
- **[Acta de entrega](docs/ENTREGA.md):** qué se entrega, estado actual y pasos para ponerlo en línea.

- **[Guía de usuario](docs/GUIA_DE_USUARIO.md):** para el personal del albergue. Cómo cambiar la información, agregar animales, avisos y fotos, y usar el panel día a día.
- **[README técnico](docs/README_TECNICO.md):** instalación, publicación, Google Sheets, **propuesta de base de datos** y **cómo conectar el WhatsApp del albergue**.
- [`docs/base-de-datos/esquema.sql`](docs/base-de-datos/esquema.sql): base de datos propuesta (PostgreSQL / Supabase).
- [`docs/whatsapp/whatsapp-webhook.mjs`](docs/whatsapp/whatsapp-webhook.mjs): integración propuesta con WhatsApp Cloud API.

## ⚡ Inicio rápido

```bash
npm install
npm run dev         # sitio: http://localhost:5173  ·  panel: http://localhost:5173/admin.html
npm run verificar   # revisa los datos antes de publicar
npm run build       # genera dist/ para publicar (Netlify, GitHub Pages o servidor municipal)
```

## ✏️ Qué se edita

| Archivo | Contenido |
|---|---|
| `public/datos/albergue.json` | Nombre, logo, contacto y WhatsApp, redes, sede y mapa, historia, adopción y cuestionario, donaciones y transparencia |
| `public/datos/animales.json` | Animales publicados |
| `public/datos/publicaciones.json` | Avisos, diario y necesidades urgentes |
| `public/datos/config.json` | Opcional: Google Sheets o Supabase como fuente de datos |
| `public/fotos/` | Fotos |

## 📜 Licencia

Licencia **MIT** (ver [LICENSE](LICENSE)): el albergue y la Municipalidad pueden usar, modificar y adaptar libremente este proyecto, sin costo y sin pedir permiso.

---
Proyecto de Aprendizaje y Servicio — Universidad Rafael Landívar.
