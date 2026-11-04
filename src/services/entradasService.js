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
 * Resultado de validación para la interfaz.
 * @typedef {Object} ResultadoValidacion
 * @property {"valida"|"ya_usada"|"invalida"|"otra_funcion"|"anulada"} estado
 * @property {boolean} accesoPermitido
 * @property {string} mensaje
 * @property {Object|null} entrada  — { codigo, fila, numero, asiento, estado }
 * @property {Object|null} funcion  — { id, pelicula, sala, inicio }
 * @property {Object|null} primerUso — { fecha, taquillero } (solo en ya_usada)
 */

/**
 * Valida una entrada en puerta (POST /validaciones). El backend responde 200 en todos
 * los resultados de negocio; aquí se normaliza a la forma de arriba. La interfaz distingue
 * por `estado`. Un fallo real de red sí lanza ApiError.
 *
 * @param {string} codigo
 * @param {number|string|null} [funcionId] — opcional: valida que sea de esa función
 * @returns {Promise<ResultadoValidacion>}
 */
export async function validarEntrada(codigo, funcionId = null) {
  if (!usaApi("validaciones")) {
    const r = await mock.validarEntrada(codigo, funcionId)
    return {
      estado: r.estado,
      accesoPermitido: r.estado === "valida",
      mensaje: r.mensaje,
      entrada: r.entrada ? { ...r.entrada, asiento: r.entrada.asiento } : null,
      funcion: r.funcion ? { id: r.funcion.id, pelicula: r.funcion.pelicula?.titulo, sala: r.funcion.sala?.nombre, inicio: r.funcion.fechaHora } : null,
      primerUso: r.entrada?.fechaUso ? { fecha: r.entrada.fechaUso, taquillero: null } : null,
    }
  }

  const cuerpo = { codigo: String(codigo).trim().toUpperCase() }
  if (funcionId != null) cuerpo.funcion_id = Number(funcionId)
  const r = await api.post("/validaciones", cuerpo)

  const entrada = r.entrada
    ? { codigo: r.entrada.codigo, fila: r.entrada.fila, numero: r.entrada.numero,
        asiento: `${r.entrada.fila ?? ""}${r.entrada.numero ?? ""}` || null, estado: r.entrada.estado }
    : null
  const funcion = r.funcion
    ? { id: r.funcion.id, pelicula: r.funcion.pelicula, sala: r.funcion.sala, inicio: r.funcion.inicio }
    : null

  return {
    estado: r.resultado,
    accesoPermitido: r.acceso_permitido === true,
    mensaje: r.mensaje,
    entrada,
    funcion,
    primerUso: r.primer_uso ?? null,
  }
}
