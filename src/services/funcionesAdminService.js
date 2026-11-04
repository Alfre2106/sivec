/**
 * funcionesAdminService.js — Gestión de funciones (administrador).
 *
 * Con usaApi("funcionesAdmin") usa la API real; si no, la lógica simulada de
 * mock/funcionesMock.js.
 *
 *   GET  /funciones?todas=1            → todas (incluye pasadas, canceladas e inactivas)
 *   POST /funciones                    → crear
 *   PUT  /funciones/{id}               → editar (precio, sala_id, inicio, pelicula_id)
 *   POST /funciones/{id}/cancelar      → cancelar con motivo; devuelve compras afectadas
 *   GET  /funciones/{id}/afectados     → compras afectadas (consultable antes/después)
 *
 * Las funciones se devuelven con la MISMA forma que usa el panel (pelicula y sala
 * anidadas), reutilizando funcionDesdeApi de funcionesService.
 */

import { usaApi } from "./config"
import { api } from "./apiClient"
import { funcionDesdeApi } from "./funcionesService"
import * as mock from "./mock/funcionesMock"

/**
 * Lista TODAS las funciones (para el panel): pasadas, canceladas e inactivas incluidas.
 * @param {Object} [opciones] @param {AbortSignal} [opciones.signal]
 * @returns {Promise<Object[]>}
 */
export async function listarTodasFunciones({ signal } = {}) {
  if (!usaApi("funcionesAdmin")) return mock.listarTodasFunciones()
  const { funciones } = await api.get("/funciones", { params: { todas: 1 }, signal })
  return funciones.map(funcionDesdeApi)
}

/** Cuerpo del formulario → cuerpo de la API. */
function funcionHaciaApi(datos) {
  const cuerpo = {}
  if (datos.peliculaId !== undefined) cuerpo.pelicula_id = Number(datos.peliculaId)
  if (datos.salaId !== undefined) cuerpo.sala_id = Number(datos.salaId)
  if (datos.precio !== undefined) cuerpo.precio = Number(datos.precio)
  // La API espera "inicio" (ISO); el formulario usa "fechaHora"
  if (datos.fechaHora !== undefined) cuerpo.inicio = datos.fechaHora
  return cuerpo
}

/**
 * Crea una función (y sus asientos, en una transacción).
 * @throws {ApiError} 422 (CAMPOS_REQUERIDOS, PRECIO_INVALIDO, INICIO_NO_FUTURO…)
 */
export async function crearFuncion(datos) {
  if (!usaApi("funcionesAdmin")) return mock.crearFuncion(datos)
  const { funcion } = await api.post("/funciones", funcionHaciaApi(datos))
  return funcionDesdeApi(funcion)
}

/**
 * Edita una función. No se edita una cancelada o iniciada; con ventas/reservas, solo el precio.
 * @throws {ApiError} 404, 409, 422
 */
export async function actualizarFuncion(id, datos) {
  if (!usaApi("funcionesAdmin")) return mock.actualizarFuncion(id, datos)
  const { funcion } = await api.put(`/funciones/${encodeURIComponent(id)}`, funcionHaciaApi(datos))
  return funcionDesdeApi(funcion)
}

/** Compra afectada de la API → forma de interfaz. */
function compraAfectadaDesdeApi(c) {
  return {
    compraId: c.compra_id,
    numero: c.numero,
    cantidadEntradas: c.cantidad_entradas,
    total: c.total,
    metodoPago: c.metodo_pago,
    cliente: c.cliente ?? null,
  }
}

/**
 * Cancela una función con un motivo. Anula entradas activas y libera reservas.
 * @param {string|number} id
 * @param {string} motivo
 * @returns {Promise<{funcion, entradasAnuladas, totalReembolsar, comprasAfectadas}>}
 * @throws {ApiError} 404, 409 (FUNCION_YA_CANCELADA/FUNCION_FINALIZADA), 422 MOTIVO_REQUERIDO
 */
export async function cancelarFuncion(id, motivo) {
  if (!usaApi("funcionesAdmin")) {
    const funcion = await mock.cancelarFuncion(id)
    return { funcion, entradasAnuladas: 0, totalReembolsar: 0, comprasAfectadas: [] }
  }
  const r = await api.post(`/funciones/${encodeURIComponent(id)}/cancelar`, { motivo })
  return {
    funcion: funcionDesdeApi(r.funcion),
    entradasAnuladas: r.entradas_anuladas ?? 0,
    totalReembolsar: r.total_a_reembolsar ?? 0,
    comprasAfectadas: (r.compras_afectadas ?? []).map(compraAfectadaDesdeApi),
  }
}

/**
 * Compras afectadas de una función (aprobadas), antes o después de cancelar.
 * @returns {Promise<Object[]>}
 */
export async function comprasAfectadas(id, { signal } = {}) {
  if (!usaApi("funcionesAdmin")) return []
  const { compras_afectadas } = await api.get(`/funciones/${encodeURIComponent(id)}/afectados`, { signal })
  return (compras_afectadas ?? []).map(compraAfectadaDesdeApi)
}
