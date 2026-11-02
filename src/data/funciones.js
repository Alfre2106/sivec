/**
 * funciones.js — Funciones (proyecciones) de SIVEC.
 *
 * Reglas aplicadas:
 *  - Todas las fechas son RELATIVAS a hoy (date-fns), nunca fijas.
 *  - f_hoy_pasada: función de HOY que ya inició → probar "no vender funciones iniciadas".
 *  - f_cancelada:  función cancelada → probar anulación de entradas.
 *  - 3-5 funciones por película, repartidas entre las dos salas.
 *  - Horarios típicos: 14:00, 16:30, 19:00, 21:30.
 *  - Precio fijo: $20.000 COP.
 *  - Estado: "activa" | "cancelada" | "finalizada"
 */

import {
  addDays, subHours,
  setHours, setMinutes, setSeconds,
  startOfDay,
} from "date-fns"

// ── Helpers de fecha ──────────────────────────────────────────────────────────

/** Fecha futura relativa a hoy con hora exacta */
const fd = (diasOffset, hora, min = 0) => {
  const base = setSeconds(setMinutes(setHours(startOfDay(new Date()), hora), min), 0)
  return addDays(base, diasOffset).toISOString()
}

/**
 * Función de HOY que ya lleva 90 minutos en curso
 * → la hora de inicio es "ahora menos 90 minutos".
 * Sirve para probar la regla "no vender entradas de funciones ya iniciadas".
 */
const funcionYaIniciada = () =>
  subHours(new Date(), 1.5).toISOString()

const PRECIO = 20000

// ── Catálogo de funciones ─────────────────────────────────────────────────────
export const FUNCIONES_MOCK = [

  // ─── p1 · Intensa-Mente 2 (5 funciones) ───────────────────────────────────
  { id: "f01", peliculaId: "p1", salaId: "s1", fechaHora: fd(0, 14,  0), precio: PRECIO, estado: "activa"    },
  { id: "f02", peliculaId: "p1", salaId: "s2", fechaHora: fd(0, 19,  0), precio: PRECIO, estado: "activa"    },
  { id: "f03", peliculaId: "p1", salaId: "s1", fechaHora: fd(1, 16, 30), precio: PRECIO, estado: "activa"    },
  { id: "f04", peliculaId: "p1", salaId: "s2", fechaHora: fd(2, 21, 30), precio: PRECIO, estado: "activa"    },
  { id: "f05", peliculaId: "p1", salaId: "s1", fechaHora: fd(4, 14,  0), precio: PRECIO, estado: "activa"    },

  // ─── p2 · Deadpool & Wolverine (4 funciones) ──────────────────────────────
  { id: "f06", peliculaId: "p2", salaId: "s2", fechaHora: fd(0, 16, 30), precio: PRECIO, estado: "activa"    },
  { id: "f07", peliculaId: "p2", salaId: "s1", fechaHora: fd(1, 19,  0), precio: PRECIO, estado: "activa"    },
  { id: "f08", peliculaId: "p2", salaId: "s2", fechaHora: fd(3, 21, 30), precio: PRECIO, estado: "activa"    },
  // Función cancelada para probar anulación de entradas
  { id: "f09", peliculaId: "p2", salaId: "s1", fechaHora: fd(5, 14,  0), precio: PRECIO, estado: "cancelada" },

  // ─── p3 · La Odisea (4 funciones) ────────────────────────────────────────
  { id: "f10", peliculaId: "p3", salaId: "s1", fechaHora: fd(0, 21, 30), precio: PRECIO, estado: "activa"    },
  { id: "f11", peliculaId: "p3", salaId: "s2", fechaHora: fd(1, 14,  0), precio: PRECIO, estado: "activa"    },
  { id: "f12", peliculaId: "p3", salaId: "s1", fechaHora: fd(3, 16, 30), precio: PRECIO, estado: "activa"    },
  { id: "f13", peliculaId: "p3", salaId: "s2", fechaHora: fd(6, 19,  0), precio: PRECIO, estado: "activa"    },

  // ─── p4 · Moana (3 funciones) ─────────────────────────────────────────────
  { id: "f14", peliculaId: "p4", salaId: "s2", fechaHora: fd(1, 16, 30), precio: PRECIO, estado: "activa"    },
  { id: "f15", peliculaId: "p4", salaId: "s1", fechaHora: fd(2, 14,  0), precio: PRECIO, estado: "activa"    },
  { id: "f16", peliculaId: "p4", salaId: "s2", fechaHora: fd(5, 19,  0), precio: PRECIO, estado: "activa"    },

  // ─── p5 · La Noche del Demonio (4 funciones) ─────────────────────────────
  { id: "f17", peliculaId: "p5", salaId: "s1", fechaHora: fd(0, 21, 30), precio: PRECIO, estado: "activa"    },
  { id: "f18", peliculaId: "p5", salaId: "s2", fechaHora: fd(2, 21, 30), precio: PRECIO, estado: "activa"    },
  { id: "f19", peliculaId: "p5", salaId: "s1", fechaHora: fd(4, 19,  0), precio: PRECIO, estado: "activa"    },
  { id: "f20", peliculaId: "p5", salaId: "s2", fechaHora: fd(6, 21, 30), precio: PRECIO, estado: "activa"    },

  // ─── p6 · Scary Movie (3 funciones) ──────────────────────────────────────
  { id: "f21", peliculaId: "p6", salaId: "s2", fechaHora: fd(1, 19,  0), precio: PRECIO, estado: "activa"    },
  { id: "f22", peliculaId: "p6", salaId: "s1", fechaHora: fd(3, 16, 30), precio: PRECIO, estado: "activa"    },
  { id: "f23", peliculaId: "p6", salaId: "s2", fechaHora: fd(5, 14,  0), precio: PRECIO, estado: "activa"    },

  // ─── p7 · Spider-Man: Brand New Day (3 funciones) ───────────────────────
  { id: "f24", peliculaId: "p7", salaId: "s1", fechaHora: fd(1, 19,  0), precio: PRECIO, estado: "activa" },
  { id: "f25", peliculaId: "p7", salaId: "s2", fechaHora: fd(3, 21, 30), precio: PRECIO, estado: "activa" },
  { id: "f26", peliculaId: "p7", salaId: "s1", fechaHora: fd(5, 16, 30), precio: PRECIO, estado: "activa" },

  // ─── Función especial: HOY, ya iniciada (para prueba de regla de negocio) ─
  {
    id: "f_iniciada",
    peliculaId: "p1",
    salaId: "s1",
    fechaHora: funcionYaIniciada(),   // hace ~90 minutos
    precio: PRECIO,
    estado: "activa",   // estado "activa" pero ya inició → la UI debe bloquearlo
  },
]
