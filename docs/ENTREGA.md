# Acta de entrega del proyecto

| | |
|---|---|
| **Proyecto** | Sitio web y Panel de gestión para el Albergue Municipal de Mascotas de Mixco |
| **Entregado por** | Lizbeth Andrea Herrera Ortega, Marcela Nicole Letran Lee e Ian Andrés Ponce Valdizón |
| **Institución** | Universidad Rafael Landívar — Ética Aplicada, Sección 24 · Proyecto de Aprendizaje y Servicio |
| **Versión** | 1.0 · noviembre de 2026 |

---

## 1. Qué se entrega

| Entregable | Descripción | Dónde está |
|---|---|---|
| Sitio web público | Página de una sola vista con adopción, avisos, diario, finales felices, cuestionario de adopción, donaciones, transparencia, historia, sede y contacto. Funciona en computadora y celular. | Código: carpeta del repositorio · Listo para publicar: `sitio-listo-para-publicar.zip` |
| Panel de gestión | Registro interno de animales, procedimientos veterinarios, solicitudes de adopción, adopciones y seguimientos, con respaldos y exportación a Excel. | `admin.html` dentro del mismo sitio |
| Plantillas de datos | Archivos editables (JSON) y plantillas para Google Sheets. | `public/datos/` y `plantillas/google-sheets/` |
| Propuesta de base de datos | Esquema PostgreSQL / Supabase con seguridad, reglas automáticas e informes. | `docs/base-de-datos/esquema.sql` |
| Propuesta de integración con WhatsApp | Conexión automática de mensajes de WhatsApp con la base de datos. | `docs/whatsapp/whatsapp-webhook.mjs` |
| Guía de usuario | Manual para el personal: cómo cambiar la información y usar el panel. | `docs/pdf/Guia-de-usuario.pdf` |
| README técnico | Manual de instalación, publicación, mantenimiento, base de datos y WhatsApp. | `docs/pdf/README-tecnico.pdf` |

## 2. Estado actual

- ✅ El sitio y el panel están **terminados y probados** (computadora y celular).
- ✅ Todos los botones y enlaces funcionan; los de WhatsApp usan el número que se configure.
- ⚠️ **Todos los datos son de ejemplo o ficticios.** Por respeto a la institución y a la ausencia de un convenio formal, no se usaron datos, fotos ni información real del albergue.
- ⏸️ La base de datos en la nube y la integración automática con WhatsApp se entregan como **propuesta documentada**, para implementarse solo si existe un acuerdo de manejo de datos personales con la Municipalidad.

## 3. Datos que el albergue debe proporcionar o reemplazar

El comando `npm run verificar` lista cada dato pendiente. En resumen:

- [ ] Teléfono, número de WhatsApp y correo oficiales
- [ ] Dirección, punto de referencia, horarios y enlace de Google Maps
- [ ] Logo oficial (opcional)
- [ ] Historia, años importantes, misión y visión
- [ ] Requisitos de adopción y preguntas del cuestionario (revisar las propuestas)
- [ ] Cuentas bancarias oficiales para donaciones y, si existe, enlace de pago verificado
- [ ] Animales reales con fotos autorizadas
- [ ] Jornadas, campañas y necesidades actuales
- [ ] Cifras de transparencia del mes

## 4. Pasos recomendados para ponerlo en línea

1. Designar a una persona responsable de la página y a otra (o la misma) del panel.
2. Reemplazar los datos de ejemplo (Guía de usuario, secciones 3 a 5).
3. Ejecutar `npm run verificar` hasta que no haya errores ni datos pendientes.
4. Publicar gratis en Netlify (README técnico, sección 6). Opcionalmente, conectar un dominio propio.
5. Configurar WhatsApp Business con respuestas rápidas y etiquetas (README técnico, sección 10, nivel 2).
6. Capacitar al personal con los datos de ejemplo del panel y luego borrarlos.
7. Establecer el respaldo semanal del panel.

## 5. Principios con los que se construyó

- **Sostenibilidad:** sin costos fijos ni servidores que mantener; el personal solo edita datos.
- **Seguridad en donaciones:** el sitio no procesa pagos ni guarda datos financieros.
- **Privacidad:** los datos personales nunca se publican; viven solo en el panel interno.
- **Dignidad y adopción responsable:** mensajes que invitan a adoptar de forma consciente, sin imágenes ni textos sensacionalistas.
- **Autonomía del albergue:** todo es editable y documentado para que la institución lo use y lo adapte sin depender del equipo que lo desarrolló.
