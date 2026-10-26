import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'

// Dev only: serve ./content at <base>/content (the build copies it into dist/).
const serveContent = (): Plugin => ({
  name: 'serve-content',
  apply: 'serve',
  configureServer(server) {
    const base = server.config.base.replace(/\/$/, '')
    server.middlewares.use(`${base}/content`, (req, res, next) => {
      const file = path.join(import.meta.dirname, 'content', decodeURIComponent((req.url ?? '').split('?')[0]))
      if (!file.startsWith(path.join(import.meta.dirname, 'content')) || !existsSync(file) || !statSync(file).isFile()) return next()
      if (file.endsWith('.pdf')) res.setHeader('Content-Type', 'application/pdf')
      createReadStream(file).pipe(res)
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project site: served from /<repo>/. Set BASE_PATH in CI
  // (the Pages workflow does it automatically); "/" for dev and custom domains.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss(), serveContent()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
})
