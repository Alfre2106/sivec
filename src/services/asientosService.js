/**
 * asientosService.js — Servicio de gestión de asientos.
 *
 * Estados válidos: "disponible" | "reservado" | "vendido"
 * "Seleccionado" es solo visual en CartContext, nunca llega aquí.
 *
 * TTL de reserva: 5 minutos.
 *
 * HOY: Opera en memoria con ASIENTOS_MOCK.
 * DESPUÉS: GET/POST /api/funciones/:id/asientos  +  WebSocket/SSE para polling.
 */

import { simularLatencia } from "./config"
import { ASIENTOS_MOCK, generarAsientos } from "@/data/asientos"
import { SALAS_MOCK } from "@/data/salas"
import { obtenerFuncion } from "./funcionesService"
import { cargar, guardar } from "./almacenamiento"

// ── Estado de asientos persistido en localStorage ─────────────────────────────
const estadoAsientos = cargar("asientos", () => {
  const inicial = {}
  for (const [fid, lista] of Object.entries(ASIENTOS_MOCK)) {
    inicial[fid] = lista.map((a) => ({ ...a }))
  }
  return inicial
})

/** Persiste el estado de todos los asientos. */
const persistir = () => guardar("asientos", estadoAsientos)

// Al cargar, cualquier asiento que quedó "reservado" de una sesión previa
// (sin reserva activa viva) se devuelve a "disponible": las reservas no persisten.
for (const lista of Object.values(estadoAsientos)) {
  for (const a of lista) {
    if (a.estado === "reservado") {
      a.estado = "disponible"
      a.reservadoHasta = null
    }
  }
}
persistir()

// Registro de reservas activas: { asientoId: { expira: Date, usuarioId } }
// Las reservas NO se persisten: son efímeras (TTL 5 min) y propias de cada sesión.
const reservasActivas = {}

export const TTL_RESERVA_MS = 5 * 60 * 1000  // 5 minutos

// ── Helpers internos ──────────────────────────────────────────────────────────

/** Genera asientos vacíos para una función si aún no existen en el estado. */
const inicializarSiNecesario = async (funcionId) => {
  if (estadoAsientos[funcionId]) return

  // Buscar la sala de la función para obtener dimensiones correctas
  let filas = 6
  let columnas = 12
  try {
    const funcion = await obtenerFuncion(funcionId)
    const sala = funcion.sala ?? SALAS_MOCK[0]
    filas    = sala.filas
    columnas = sala.columnas
  } catch {
    // Fallback silencioso si la función no existe
  }
  estadoAsientos[funcionId] = generarAsientos(funcionId, filas, columnas)
  persistir()
}

/** Libera reservas cuyo TTL ya venció y devuelve los asientos a "disponible". */
const limpiarReservasVencidas = () => {
  const ahora = Date.now()
  for (const [asientoId, reserva] of Object.entries(reservasActivas)) {
    if (ahora > reserva.expira.getTime()) {
      delete reservasActivas[asientoId]
      const [funcionId] = asientoId.split("-")
      const asiento = estadoAsientos[funcionId]?.find((a) => a.id === asientoId)
      if (asiento?.estado === "reservado") {
        asiento.estado = "disponible"
        asiento.reservadoHasta = null
        persistir()
      }
    }
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Devuelve todos los asientos de una función con su estado actual.
 * @param {string} funcionId
 * @returns {Promise<Object[]>}
 */
export async function obtenerAsientos(funcionId) {
  await simularLatencia(300)
  limpiarReservasVencidas()
  await inicializarSiNecesario(funcionId)
  return estadoAsientos[funcionId].map((a) => ({ ...a }))
}

/**
 * Reserva temporalmente una lista de asientos.
 * Verifica que todos estén disponibles ANTES de mutar (operación atómica mock).
 *
 * @param {string}   funcionId
 * @param {string[]} asientoIds  — IDs completos, e.g. ["f01-A1","f01-A2"]
 * @param {string}   usuarioId
 * @returns {Promise<{ asientos: Object[], expira: Date }>}
 * @throws {Error} Si algún asiento ya no está disponible
 */
export async function reservarAsientos(funcionId, asientoIds, usuarioId) {
  await simularLatencia(400)
  limpiarReservasVencidas()
  await inicializarSiNecesario(funcionId)

  const lista = estadoAsientos[funcionId]

  // Verificación atómica: todos deben estar disponibles
  for (const id of asientoIds) {
    const a = lista.find((x) => x.id === id)
    if (!a) throw new Error(`Asiento ${id} no existe en esta función.`)
    if (a.estado !== "disponible") {
      throw new Error(`El asiento ${a.codigo} ya no está disponible.`)
    }
  }

  const expira = new Date(Date.now() + TTL_RESERVA_MS)

  for (const id of asientoIds) {
    const a = lista.find((x) => x.id === id)
    a.estado = "reservado"
    a.reservadoHasta = expira.toISOString()
    reservasActivas[id] = { expira, usuarioId }
  }
  persistir()

  return { asientos: asientoIds.map((id) => lista.find((a) => a.id === id)), expira }
}

/**
 * Confirma la venta: reservado/disponible → vendido.
 * @param {string}   funcionId
 * @param {string[]} asientoIds
 * @returns {Promise<void>}
 */
export async function confirmarVenta(funcionId, asientoIds) {
  await simularLatencia(200)
  const lista = estadoAsientos[funcionId]
  if (!lista) throw new Error("Función no encontrada en el mapa de asientos.")
  for (const id of asientoIds) {
    const a = lista.find((x) => x.id === id)
    if (a) {
      a.estado = "vendido"
      a.reservadoHasta = null
      delete reservasActivas[id]
    }
  }
  persistir()
}

/**
 * Libera asientos reservados (cancelación o expiración manual).
 * @param {string}   funcionId
 * @param {string[]} asientoIds
 * @returns {Promise<void>}
 */
export async function liberarAsientos(funcionId, asientoIds) {
  await simularLatencia(150)
  const lista = estadoAsientos[funcionId]
  if (!lista) return
  for (const id of asientoIds) {
    const a = lista.find((x) => x.id === id)
    if (a?.estado === "reservado") {
      a.estado = "disponible"
      a.reservadoHasta = null
      delete reservasActivas[id]
    }
  }
  persistir()
}
