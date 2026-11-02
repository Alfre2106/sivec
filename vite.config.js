import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// vite.config.js — Configuración de Vite para SIVEC
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Alias @ para importaciones limpias desde src/
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
})
