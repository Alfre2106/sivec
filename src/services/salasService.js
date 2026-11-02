/**
 * salasService.js — Servicio CRUD de salas.
 *
 * HOY: Opera en memoria sobre SALAS_MOCK.
 * DESPUÉS: GET/POST/PUT/DELETE /api/salas
 */

import { simularLatencia } from "./config"
import { SALAS_MOCK } from "@/data/salas"
import { cargar, guardar } from "./almacenamiento"

let salas = cargar("salas", () => SALAS_MOCK.map((s) => ({ ...s })))

const persistir = () => guardar("salas", salas)

/** Lista todas las salas. */
export async function listarSalas() {
  await simularLatencia(300)
  return salas.map((s) => ({ ...s }))
}

/** Obtiene una sala por ID. */
export async function obtenerSala(id) {
  await simularLatencia(200)
  const sala = salas.find((s) => s.id === id)
  if (!sala) throw new Error("Sala no encontrada.")
  return { ...sala }
}

/**
 * Crea una nueva sala. La capacidad se calcula como filas × columnas.
 * @param {Object} datos — { nombre, filas, columnas, tipo }
 */
export async function crearSala(datos) {
  await simularLatencia(400)
  const nueva = {
    id: `s${Date.now()}`,
    activa: true,
    ...datos,
    capacidad: (datos.filas ?? 0) * (datos.columnas ?? 0),
  }
  salas.push(nueva)
  persistir()
  return { ...nueva }
}

/** Actualiza una sala (recalcula capacidad). */
export async function actualizarSala(id, datos) {
  await simularLatencia(350)
  const idx = salas.findIndex((s) => s.id === id)
  if (idx === -1) throw new Error("Sala no encontrada.")
  const actualizada = { ...salas[idx], ...datos }
  actualizada.capacidad = (actualizada.filas ?? 0) * (actualizada.columnas ?? 0)
  salas[idx] = actualizada
  persistir()
  return { ...actualizada }
}

/** Elimina una sala. */
export async function eliminarSala(id) {
  await simularLatencia(300)
  salas = salas.filter((s) => s.id !== id)
  persistir()
}
