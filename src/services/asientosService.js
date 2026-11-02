/**
 * asientosService.js — Servicio de gestión de asientos.
 *
 * Maneja estados: "disponible" | "reservado" | "vendido"
 * La reserva tiene un TTL de 5 minutos; al vencer, vuelve a "disponible".
 *
 * HOY: Opera en memoria con datos mock.
 * DESPUÉS: Reemplazar con fetch/axios; el polling pasará a WebSocket/SSE.
 */

import { simularLatencia } from "./config"
import { ASIENTOS_MOCK } from "@/data/asientos"
import { SALAS_MOCK } from "@/data/salas"

// Copia mutable en memoria (se modifica con reservas y ventas)
const estadoAsientos = {}
for (const [funcionId, lista] of Object.entries(ASIENTOS_MOCK)) {
  estadoAsientos[funcionId] = lista.map((a) => ({ ...a }))
}

// Registro de reservas activas: { "f1-A1": { expira: Date, usuarioId: string } }
const reservasActivas = {}

// TTL de la reserva en milisegundos (5 minutos)
export const TTL_RESERVA_MS = 5 * 60 * 1000

/**
 * Asegura que existen asientos para la función indicada.
 * Si la función no tiene asientos en el mock, los genera vacíos.
 * @param {string} funcionId
 */
const inicializarSiNecesario = (funcionId) => {
  if (!estadoAsientos[funcionId]) {
    const sala = SALAS_MOCK[0] // fallback sala por defecto
    const letras = "ABCDEF"
    estadoAsientos[funcionId] = []
    for (let f = 0; f < sala.filas; f++) {
      for (let c = 1; c <= sala.columnas; c++) {
        const codigo = `${letras[f]}${c}`
        estadoAsientos[funcionId].push({
          id: `${funcionId}-${codigo}`,
          funcionId,
          fila: letras[f],
          columna: c,
          codigo,
          estado: "disponible",
        })
      }
    }
  }
}

/**
 * Limpia reservas vencidas y libera los asientos correspondientes.
 * Se llama antes de cualquier lectura para mantener consistencia.
 */
const limpiarReservasVencidas = () => {
  const ahora = Date.now()
  for (const [asientoId, reserva] of Object.entries(reservasActivas)) {
    if (ahora > reserva.expira.getTime()) {
      delete reservasActivas[asientoId]
      // Liberar el asiento si sigue en estado "reservado"
      const [funcionId] = asientoId.split("-")
      const asientos = estadoAsientos[funcionId]
      if (asientos) {
        const asiento = asientos.find((a) => a.id === asientoId)
        if (asiento && asiento.estado === "reservado") {
          asiento.estado = "disponible"
        }
      }
    }
  }
}

/**
 * Obtiene todos los asientos de una función con su estado actual.
 * @param {string} funcionId
 * @returns {Promise<Object[]>}
 */
export async function obtenerAsientos(funcionId) {
  await simularLatencia(200)
  limpiarReservasVencidas()
  inicializarSiNecesario(funcionId)
  return estadoAsientos[funcionId].map((a) => ({ ...a }))
}

/**
 * Reserva temporalmente una lista de asientos para un usuario.
 * @param {string} funcionId
 * @param {string[]} asientoIds — IDs completos de los asientos
 * @param {string} usuarioId
 * @returns {Promise<{ asientos: Object[], expira: Date }>}
 * @throws {Error} Si algún asiento no está disponible
 */
export async function reservarAsientos(funcionId, asientoIds, usuarioId) {
  await simularLatencia(300)
  limpiarReservasVencidas()
  inicializarSiNecesario(funcionId)

  const asientos = estadoAsientos[funcionId]

  // Verificar que todos están disponibles antes de mutar
  for (const id of asientoIds) {
    const asiento = asientos.find((a) => a.id === id)
    if (!asiento) throw new Error(`Asiento ${id} no existe.`)
    if (asiento.estado !== "disponible") {
      throw new Error(`El asiento ${asiento.codigo} ya no está disponible.`)
    }
  }

  const expira = new Date(Date.now() + TTL_RESERVA_MS)

  // Marcar como reservados
  for (const id of asientoIds) {
    const asiento = asientos.find((a) => a.id === id)
    asiento.estado = "reservado"
    reservasActivas[id] = { expira, usuarioId }
  }

  return {
    asientos: asientoIds.map((id) => asientos.find((a) => a.id === id)),
    expira,
  }
}

/**
 * Confirma la venta de los asientos reservados (estado → "vendido").
 * Elimina la reserva activa.
 * @param {string} funcionId
 * @param {string[]} asientoIds
 * @returns {Promise<void>}
 */
export async function confirmarVenta(funcionId, asientoIds) {
  await simularLatencia(200)
  const asientos = estadoAsientos[funcionId]
  if (!asientos) throw new Error("Función no encontrada.")

  for (const id of asientoIds) {
    const asiento = asientos.find((a) => a.id === id)
    if (asiento) {
      asiento.estado = "vendido"
      delete reservasActivas[id]
    }
  }
}

/**
 * Libera asientos reservados (si el usuario cancela o expira).
 * @param {string} funcionId
 * @param {string[]} asientoIds
 * @returns {Promise<void>}
 */
export async function liberarAsientos(funcionId, asientoIds) {
  await simularLatencia(150)
  const asientos = estadoAsientos[funcionId]
  if (!asientos) return

  for (const id of asientoIds) {
    const asiento = asientos.find((a) => a.id === id)
    if (asiento && asiento.estado === "reservado") {
      asiento.estado = "disponible"
      delete reservasActivas[id]
    }
  }
}
