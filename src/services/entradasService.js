/**
 * entradasService.js — Entradas (lectura) y validación.
 *
 * Con usaApi("entradas") usa la API real:
 *   GET /entradas/{id}       → datos de una entrada
 *   GET /entradas/{id}/qr    → imagen PNG del QR (requiere token; se pide por fetch)
 * La VALIDACIÓN en puerta (POST /validaciones) se migra en la Fase I5; por ahora
 * validarEntrada sigue usando la lógica simulada.
 */

import { usaApi } from "./config"
import { api } from "./apiClient"
import { entradaDesdeApi } from "./comprasService"
import * as mock from "./mock/entradasMock"

/**
 * Datos de una entrada por su id.
 * @param {number|string} id
 * @param {Object} [opciones] @param {AbortSignal} [opciones.signal]
 * @returns {Promise<Object>} entrada en forma de interfaz (+ funcionId, compraId)
 * @throws {ApiError} 403 ENTRADA_AJENA, 404 ENTRADA_NO_ENCONTRADA
 */
export async function obtenerEntrada(id, { signal } = {}) {
  if (!usaApi("entradas")) throw new Error("obtenerEntrada no está disponible en modo simulado")
  const { entrada } = await api.get(`/entradas/${encodeURIComponent(id)}`, { signal })
  return { ...entradaDesdeApi(entrada), funcionId: entrada.funcion_id, compraId: entrada.compra_id }
}

/**
 * Descarga el PNG del QR de una entrada (con token) y devuelve un object URL.
 * El llamador debe revocarlo con URL.revokeObjectURL cuando ya no lo use.
 * @param {number|string} id
 * @param {Object} [opciones] @param {AbortSignal} [opciones.signal]
 * @returns {Promise<string>} object URL de la imagen
 */
export async function urlQrEntrada(id, { signal } = {}) {
  const { blob } = await api.descargar(`/entradas/${encodeURIComponent(id)}/qr`, { signal })
  return URL.createObjectURL(blob)
}

/**
 * Valida una entrada en puerta. AÚN SIMULADO (se migra a POST /validaciones en la Fase I5).
 * @param {string} codigo
 * @param {string|number|null} [funcionIdActual]
 */
export async function validarEntrada(codigo, funcionIdActual = null) {
  return mock.validarEntrada(codigo, funcionIdActual)
}
