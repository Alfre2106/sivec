/**
 * fechas.js — Formateo de fechas en hora de Bogotá con Intl.DateTimeFormat.
 *
 * La API entrega ISO 8601 con zona (ej: 2026-11-03T22:44:03-05:00). Aquí se muestran
 * siempre en America/Bogota, sin depender de la zona del navegador ni de librerías.
 * Los precios se formatean en utils/formato.js (Intl.NumberFormat, COP).
 *
 * El texto sale con el mismo aspecto que tenía con date-fns:
 *   hora "10:00 AM" (no "10:00 a. m."), día "miércoles 4 de noviembre" (sin coma).
 */

const ZONA_HORARIA = "America/Bogota"
const IDIOMA = "es-CO"

// Un formateador por combinación de opciones (crearlos es costoso)
const formateadores = new Map()

function formateadorPara(opciones) {
  const clave = JSON.stringify(opciones)
  if (!formateadores.has(clave)) {
    formateadores.set(clave, new Intl.DateTimeFormat(IDIOMA, { timeZone: ZONA_HORARIA, ...opciones }))
  }
  return formateadores.get(clave)
}

/** Convierte el valor recibido en Date, o null si no es una fecha válida. */
function aFecha(valor) {
  if (!valor) return null
  const fecha = valor instanceof Date ? valor : new Date(valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

/** Ajusta el texto de Intl al estilo de la interfaz: "a. m." → "AM" y sin coma tras el día de la semana. */
function normalizar(texto) {
  return texto
    .replace(/\s*([ap])\.\s*m\./gi, (_, letra) => ` ${letra.toUpperCase()}M`)
    .replace(/^([^\d,]+),\s*/, "$1 ")
}

/**
 * Formatea una fecha ISO (o Date) en hora de Bogotá.
 * @param {string|Date|null|undefined} valor
 * @param {Intl.DateTimeFormatOptions} [opciones] — por defecto "3 de noviembre de 2026"
 * @returns {string} el texto, o "—" si el valor falta o no es una fecha válida
 */
export function formatearFecha(valor, opciones = { day: "numeric", month: "long", year: "numeric" }) {
  const fecha = aFecha(valor)
  return fecha ? normalizar(formateadorPara(opciones).format(fecha)) : "—"
}

/** "10:44 PM" */
export const formatearHora = (valor) =>
  formatearFecha(valor, { hour: "numeric", minute: "2-digit", hour12: true })

/** "3 de noviembre de 2026" */
export const formatearFechaLarga = (valor) => formatearFecha(valor)

/**
 * Partes de la fecha en Bogotá (weekday, day, month, year) para armar formatos con mes
 * abreviado: Intl agrega "de" ("4 de nov de 2026") y la interfaz usa "4 nov 2026".
 * El mes abreviado son las 3 primeras letras del mes ("septiembre" → "sep").
 */
function partes(valor) {
  const fecha = aFecha(valor)
  if (!fecha) return null
  const p = Object.fromEntries(
    formateadorPara({ weekday: "long", day: "numeric", month: "long", year: "numeric" })
      .formatToParts(fecha)
      .map(({ type, value }) => [type, value])
  )
  return { ...p, mesCorto: p.month.slice(0, 3) }
}

/** "3 nov 2026" */
export function formatearFechaMedia(valor) {
  const p = partes(valor)
  return p ? `${p.day} ${p.mesCorto} ${p.year}` : "—"
}

/** "3 nov" */
export function formatearFechaCorta(valor) {
  const p = partes(valor)
  return p ? `${p.day} ${p.mesCorto}` : "—"
}

/** "miércoles 4 de noviembre" */
export const formatearDiaLargo = (valor) =>
  formatearFecha(valor, { weekday: "long", day: "numeric", month: "long" })

/** "miércoles 4 nov" */
export function formatearDiaCorto(valor) {
  const p = partes(valor)
  return p ? `${p.weekday} ${p.day} ${p.mesCorto}` : "—"
}

/** Pone en mayúscula solo la primera letra del texto ("jueves…" → "Jueves…"). */
export function capitalizarInicial(texto) {
  if (!texto || texto === "—") return texto
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/**
 * "Jueves 5 de noviembre de 2026" — día de la semana con mayúscula inicial y el resto
 * en minúscula (Intl.DateTimeFormat con es-CO y America/Bogota). Formato pedido para
 * las pantallas que muestran la fecha completa de una función.
 */
export const formatearDiaFechaLarga = (valor) =>
  capitalizarInicial(formatearFecha(valor, { weekday: "long", day: "numeric", month: "long", year: "numeric" }))

/** "3 nov 2026 · 10:44 PM" */
export function formatearFechaHora(valor) {
  return aFecha(valor) ? `${formatearFechaMedia(valor)} · ${formatearHora(valor)}` : "—"
}

/** "miércoles 4 nov · 10:44 PM" */
export function formatearDiaHora(valor) {
  return aFecha(valor) ? `${formatearDiaCorto(valor)} · ${formatearHora(valor)}` : "—"
}

/** "4 nov · 10:44 PM" */
export function formatearFechaCortaHora(valor) {
  return aFecha(valor) ? `${formatearFechaCorta(valor)} · ${formatearHora(valor)}` : "—"
}

// ── Días calendario en hora de Bogotá ────────────────────────────────────────

// "en-CA" da el formato AAAA-MM-DD, útil como clave para agrupar por día
const formateadorClaveDia = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_HORARIA, year: "numeric", month: "2-digit", day: "2-digit",
})

/**
 * Día calendario en hora de Bogotá, como "2026-11-04". Sirve para agrupar funciones por día:
 * una función a las 8:00 PM de Bogotá es del día siguiente en UTC, y no debe cambiar de día.
 * @returns {string|null} null si el valor no es una fecha válida
 */
export function claveDia(valor) {
  const fecha = aFecha(valor)
  return fecha ? formateadorClaveDia.format(fecha) : null
}

const MS_DIA = 24 * 60 * 60 * 1000

/** ¿Es hoy en Bogotá? */
export const esHoy = (valor) => {
  const clave = claveDia(valor)
  return clave !== null && clave === claveDia(new Date())
}

/** ¿Es mañana en Bogotá? (Colombia no tiene horario de verano) */
export const esManana = (valor) => {
  const clave = claveDia(valor)
  return clave !== null && clave === claveDia(new Date(Date.now() + MS_DIA))
}

/** "Hoy", "Mañana" o "miércoles 4 de noviembre". */
export function etiquetaDia(valor) {
  if (esHoy(valor)) return "Hoy"
  if (esManana(valor)) return "Mañana"
  return formatearDiaLargo(valor)
}
