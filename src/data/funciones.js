/**
 * funciones.js — Funciones (proyecciones) disponibles en SIVEC.
 *
 * IMPORTANTE: Las fechas se calculan de forma relativa a "hoy" para que
 * nunca queden vencidas. Se usan offsets en días desde la fecha actual.
 */

import { addDays, setHours, setMinutes, setSeconds, startOfDay } from "date-fns"

/**
 * Genera una fecha futura relativa a hoy.
 * @param {number} diasOffset — días desde hoy
 * @param {number} hora — hora del día (0-23)
 * @param {number} minutos — minutos (0-59)
 * @returns {string} Fecha en formato ISO
 */
const fechaFutura = (diasOffset, hora, minutos = 0) => {
  const hoy = startOfDay(new Date())
  const fecha = setSeconds(setMinutes(setHours(addDays(hoy, diasOffset), hora), minutos), 0)
  return fecha.toISOString()
}

export const FUNCIONES_MOCK = [
  // ── Intensamente 2 ──────────────────────────────────────────────────────
  {
    id: "f1",
    peliculaId: "p1",
    salaId: "s1",
    fechaHora: fechaFutura(1, 15, 0),   // mañana 3:00 PM
    precioBase: 15000,
    idioma: "Español",
    formato: "2D",
    estado: "activa",   // activa | cancelada | finalizada
  },
  {
    id: "f2",
    peliculaId: "p1",
    salaId: "s2",
    fechaHora: fechaFutura(2, 19, 0),   // pasado mañana 7:00 PM
    precioBase: 20000,
    idioma: "Español",
    formato: "3D",
    estado: "activa",
  },

  // ── Deadpool & Wolverine ─────────────────────────────────────────────────
  {
    id: "f3",
    peliculaId: "p2",
    salaId: "s1",
    fechaHora: fechaFutura(1, 19, 30), // mañana 7:30 PM
    precioBase: 18000,
    idioma: "Español",
    formato: "2D",
    estado: "activa",
  },
  {
    id: "f4",
    peliculaId: "p2",
    salaId: "s2",
    fechaHora: fechaFutura(3, 21, 0),
    precioBase: 22000,
    idioma: "Subtitulado",
    formato: "IMAX",
    estado: "activa",
  },

  // ── Moana 2 ─────────────────────────────────────────────────────────────
  {
    id: "f5",
    peliculaId: "p3",
    salaId: "s1",
    fechaHora: fechaFutura(2, 14, 0),
    precioBase: 15000,
    idioma: "Español",
    formato: "2D",
    estado: "activa",
  },
  {
    id: "f6",
    peliculaId: "p3",
    salaId: "s2",
    fechaHora: fechaFutura(4, 16, 30),
    precioBase: 15000,
    idioma: "Español",
    formato: "2D",
    estado: "activa",
  },

  // ── Alien: Romulus ───────────────────────────────────────────────────────
  {
    id: "f7",
    peliculaId: "p4",
    salaId: "s2",
    fechaHora: fechaFutura(1, 21, 30),
    precioBase: 18000,
    idioma: "Español",
    formato: "2D",
    estado: "activa",
  },
  {
    id: "f8",
    peliculaId: "p4",
    salaId: "s1",
    fechaHora: fechaFutura(5, 22, 0),
    precioBase: 18000,
    idioma: "Subtitulado",
    formato: "2D",
    estado: "activa",
  },

  // ── Concierto Sinfónico ──────────────────────────────────────────────────
  {
    id: "f9",
    peliculaId: "p5",
    salaId: "s1",
    fechaHora: fechaFutura(7, 20, 0),
    precioBase: 35000,
    idioma: "Instrumental",
    formato: "Evento en vivo",
    estado: "activa",
  },
]
