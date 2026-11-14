import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// base: './' permite subir la carpeta dist/ a cualquier hosting (Netlify, GitHub Pages, etc.)
// Se generan dos páginas: index.html (sitio público) y admin.html (panel de gestión)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin.html'),
      },
    },
  },
})
