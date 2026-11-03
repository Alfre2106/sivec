import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// vite.config.js — Configuración de Vite para SIVEC
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Separar librerías pesadas en su propio chunk (sintaxis de función para Rolldown/Vite 8)
        manualChunks(id) {
          if (id.includes('html5-qrcode') || id.includes('qrcode.react')) return 'vendor-qr'
          if (id.includes('recharts'))    return 'vendor-charts'
          if (id.includes('date-fns'))    return 'vendor-dates'
          if (id.includes('@radix-ui'))   return 'vendor-ui'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})