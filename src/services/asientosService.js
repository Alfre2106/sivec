/**
 * asientosService.js — Mapa de asientos y reservas.
 *
 * Con usaApi("asientos") usa la API real:
 *   GET    /funciones/{id}/asientos       → mapa (con token marca los asientos propios: mio)
 *   POST   /reservas                      → reserva todo o nada (5 min)
 *   GET    /reservas/mias?funcion_id=     → mis reservas vigentes
 *   POST   /reservas/cancelar             → libera todas mis reservas de una función
 * Si no, usa la lógica simulada de mock/asientosMock.js.
 *
 * Forma de un asiento para la interfaz (la misma que ya usaba SeatMap):
 *   { id, funcionId, codigo: "A1", fila: "A", columna: 1, estado, mio, venceEn }
 *   estado: "disponible" | "reservado" | "vendido"
 */

import { usaApi } from "./config"
import { api } from "./apiClient"
import * as mock from "./mock/asientosMock"

export const MAX_ASIENTOS_POR_RESERVA = 8

/**
 * Respuesta de GET /funciones/{id}/asientos → lista plana de asientos.
 * @param {Object} datos
 * @returns {Object[]}
 */
export function asientosDesdeApi(datos) {
  const lista = []
  for (const { fila, asientos } of datos.filas ?? []) {
    for (const a of asientos) {
      lista.push({
        id: a.id,
        funcionId: datos.funcion_id,
        codigo: `${fila}${a.numero}`,
        fila,
        columna: a.numero,
        estado: a.estado,
        mio: a.mio === true,
        venceEn: a.vence_en ?? null,
      })
    }
  }
  return lista
}

/**
 * Mapa de asientos de una función.
 * @param {number|string} funcionId
 * @param {Object} [opciones]
 * @param {AbortSignal} [opciones.signal]
 * @returns {Promise<Object[]>}
 */
export async function obtenerAsientos(funcionId, { signal } = {}) {
  if (!usaApi("asientos")) return mock.obtenerAsientos(funcionId)
  const datos = await api.get(`/funciones/${encodeURIComponent(funcionId)}/asientos`, { signal })
  return asientosDesdeApi(datos)
}

/**
 * Reserva asientos (todo o nada). El tiempo restante lo manda el servidor.
 *
 * @param {number|string} funcionId
 * @param {Array<number|string>} asientoIds
 * @param {string|number} [usuarioId] — solo lo usa la versión simulada
 * @returns {Promise<{ segundosRestantes: number, venceEn: string|null }>}
 * @throws {ApiError} 409 ASIENTO_NO_DISPONIBLE, FUNCION_NO_DISPONIBLE, LIMITE_RESERVAS;
 *                    422 DEMASIADOS_ASIENTOS, etc.
 */
export async function reservarAsientos(funcionId, asientoIds, usuarioId) {
  if (!usaApi("asientos")) {
    const r = await mock.reservarAsientos(funcionId, asientoIds, usuarioId)
    return {
      segundosRestantes: Math.max(0, Math.round((r.expira.getTime() - Date.now()) / 1000)),
      venceEn: r.expira.toISOString(),
    }
  }
  const r = await api.post("/reservas", { funcion_id: Number(funcionId), asientos: asientoIds.map(Number) })
  return { segundosRestantes: r.segundos_restantes, venceEn: r.vence_en ?? null }
}

/**
 * Mis reservas vigentes en una función.
 * @returns {Promise<{ asientoIds: number[], segundosRestantes: number }>}
 *   segundosRestantes = el menor de todas (0 si no hay reservas)
 */
export async function misReservas(funcionId, { signal } = {}) {
  if (!usaApi("asientos")) return { asientoIds: [], segundosRestantes: 0 }
  const { reservas } = await api.get("/reservas/mias", { params: { funcion_id: funcionId }, signal })
  return {
    asientoIds: reservas.map((r) => r.asiento_id),
    segundosRestantes: reservas.length ? Math.min(...reservas.map((r) => r.segundos_restantes)) : 0,
  }
}

/**
 * Cancela TODAS mis reservas activas de la función.
 * @param {number|string} funcionId
 * @param {Array<number|string>} [asientoIds] — solo lo usa la versión simulada
 * @returns {Promise<void>}
 */
export async function cancelarReservas(funcionId, asientoIds = []) {
  if (!usaApi("asientos")) return mock.liberarAsientos(funcionId, asientoIds)
  await api.post("/reservas/cancelar", { funcion_id: Number(funcionId) })
}

/**
 * Solo versión simulada: marca asientos como vendidos (la compra real llega en la Fase I4).
 * Con la API no hace nada: el servidor es quien vende.
 */
export async function confirmarVenta(funcionId, asientoIds) {
  if (usaApi("asientos")) return
  return mock.confirmarVenta(funcionId, asientoIds)
}
