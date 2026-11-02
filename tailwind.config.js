/** @type {import('tailwindcss').Config} */
// tailwind.config.js — Tokens de diseño centralizados para SIVEC
// Modifica este archivo para cambiar colores, fuentes o radios globalmente.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // ── Paleta de colores SIVEC ──────────────────────────────────────────
      colors: {
        // Violeta primario (botones, énfasis, sidebar activo)
        primario: {
          DEFAULT: "#7C3AED",
          oscuro: "#6D28D9",
          claro: "#8B5CF6",
          suave: "#EDE9FE",
        },
        // Azul noche (sidebar, fondos oscuros de panel)
        noche: {
          DEFAULT: "#1B1145",
          oscuro: "#120A2E",
          medio: "#2D1F6E",
          claro: "#3D2C8D",
        },
        // Fondo de la app pública y tarjetas claras
        fondo: {
          DEFAULT: "#F8F7FF",
          tarjeta: "#FFFFFF",
          panel: "#F1EEF9",
        },
        // Estados de asientos
        asiento: {
          disponible: "#D1D5DB",   // gris claro
          seleccionado: "#7C3AED", // violeta
          reservado: "#F59E0B",    // ámbar
          vendido: "#4B5563",      // gris oscuro
        },
        // Métricas del dashboard
        metrica: {
          ventas: "#10B981",   // verde
          entradas: "#3B82F6", // azul
          activas: "#8B5CF6",  // violeta
        },
        // Feedback / estados de validación
        exito: "#10B981",
        advertencia: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },

      // ── Tipografía ───────────────────────────────────────────────────────
      fontFamily: {
        titulo: ["Poppins", "sans-serif"],   // Títulos y logo
        cuerpo:  ["Inter",   "sans-serif"],   // Texto general
      },
      fontWeight: {
        "extrabold": "800",
      },

      // ── Bordes redondeados ───────────────────────────────────────────────
      borderRadius: {
        sivec: "1rem",       // tarjetas principales (rounded-2xl)
        boton: "0.75rem",    // botones
        asiento: "0.375rem", // asientos en el mapa
      },

      // ── Sombras suaves ───────────────────────────────────────────────────
      boxShadow: {
        tarjeta: "0 4px 20px rgba(109, 40, 217, 0.08)",
        boton:   "0 4px 14px rgba(124, 58, 237, 0.35)",
        sidebar: "4px 0 20px rgba(18, 10, 46, 0.3)",
      },

      // ── Degradados ───────────────────────────────────────────────────────
      backgroundImage: {
        "degradado-violeta": "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
        "degradado-hero":    "linear-gradient(to right, rgba(18,10,46,0.85) 0%, rgba(18,10,46,0.4) 100%)",
        "degradado-sidebar": "linear-gradient(180deg, #120A2E 0%, #1B1145 100%)",
      },
    },
  },
  plugins: [
    // Plugin de formularios para estilos base de inputs
    require("@tailwindcss/forms"),
  ],
}
