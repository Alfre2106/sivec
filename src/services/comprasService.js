/**
 * comprasService.js — Compras (pago simulado) y lectura de "mis compras".
 *
 * Con usaApi("compras") usa la API real:
 *   POST /compras             → paga (aprobado | rechazado) y, si aprueba, devuelve las entradas
 *   GET  /mis-compras         → compras aprobadas del cliente (más recientes primero)
 *   GET  /ventas              → ventas del taquillero/admin (historial, Fase I5/I6)
 * Si no, usa la lógica simulada de mock/comprasMock.js.
 *
 * El backend ya reservó los asientos en la Fase I3; aquí el "pago" convierte
 * esa reserva en venta. El cliente usa su propia ficha; el taquillero manda `cliente`.
 *
 * Forma de compra para la interfaz (la que ya usaban las pantallas):
 *   { id, numero, total, metodoPago, estadoPago, estado, fechaCompra, funcionId,
 *     funcionResumen: { id, pelicula, inicio, estado },
 *     cliente, entradas: [{ id, codigo, asiento, fila, numero, estado, fechaUso }] }
 */

import { usaApi } from "./config"
import { api, ApiError } from "./apiClient"
import * as mock from "./mock/comprasMock"

/** Entrada de la API → entrada de la interfaz. */
export function entradaDesdeApi(e) {
  return {
    id: e.id,
    codigo: e.codigo,
    fila: e.fila,
    numero: e.numero,
    asiento: `${e.fila}${e.numero}`,
    estado: e.estado,
    fechaUso: e.usada_en ?? null,
  }
}

/** Compra/venta de la API → compra de la interfaz. */
export function compraDesdeApi(c, entradas = [], cliente = null) {
  return {
    id: c.id,
    numero: c.numero,
    total: c.total,
    metodoPago: c.metodo_pago,
    estadoPago: c.estado_pago,
    // La interfaz muestra "confirmada/cancelada": una compra aprobada cuya función
    // se canceló se ve "cancelada"; el resto, "confirmada".
    estado: c.funcion?.estado === "cancelada" ? "cancelada" : "confirmada",
    fechaCompra: c.creado_en,
    funcionId: c.funcion?.id ?? null,
    funcionResumen: c.funcion
      ? { id: c.funcion.id, pelicula: c.funcion.pelicula, inicio: c.funcion.inicio, estado: c.funcion.estado }
      : null,
    cliente: cliente ?? c.cliente ?? null,
    entradas: entradas.map(entradaDesdeApi),
  }
}

/**
 * Paga una compra. Los asientos ya están reservados (Fase I3): basta la función.
 *
 * @param {Object} datos
 * @param {number|string} datos.funcionId
 * @param {Array<number|string>} [datos.asientoIds] — opcional; si se omite usa mis reservas
 * @param {"tarjeta"|"efectivo"} [datos.metodoPago="tarjeta"]
 * @param {boolean} [datos.simularRechazo=false]
 * @param {{nombre:string, documento?:string, contacto?:string}} [datos.cliente] — solo taquilla
 * @returns {Promise<{ compra, entradas }>}
 * @throws {ApiError} 402 PAGO_RECHAZADO (con detalle.compra_id, vence_en),
 *                    409 RESERVA_VENCIDA / ASIENTO_NO_DISPONIBLE / FUNCION_NO_DISPONIBLE
 */
export async function crearCompra(datos) {
  if (!usaApi("compras")) return compraMock(datos)

  const cuerpo = {
    funcion_id: Number(datos.funcionId),
    metodo_pago: datos.metodoPago ?? "tarjeta",
    resultado_simulado: datos.simularRechazo ? "rechazado" : "aprobado",
  }
  if (datos.asientoIds?.length) cuerpo.asientos = datos.asientoIds.map(Number)
  if (datos.cliente) cuerpo.cliente = datos.cliente

  const { compra, entradas } = await api.post("/compras", cuerpo)
  const resultado = compraDesdeApi(compra, entradas, datos.cliente)
  return { compra: resultado, entradas: resultado.entradas }
}

/** Adaptador: la versión simulada usa otra firma y devuelve la compra directa. */
async function compraMock(datos) {
  const compra = await mock.crearCompra({
    usuarioId: datos.usuarioId ?? "anonimo",
    funcionId: datos.funcionId,
    asientoIds: datos.asientoIds ?? [],
    codigosAsiento: datos.codigosAsiento ?? [],
    total: datos.total ?? 0,
    simularRechazo: datos.simularRechazo,
    clienteNombre: datos.cliente?.nombre ?? datos.clienteNombre ?? null,
    clienteDocumento: datos.cliente?.documento ?? datos.clienteDocumento ?? null,
  })
  return { compra, entradas: compra.entradas }
}

/**
 * Mis compras aprobadas (rol cliente).
 * @param {Object} [opciones]
 * @param {AbortSignal} [opciones.signal]
 * @returns {Promise<Object[]>}
 */
export async function misCompras(opciones = {}) {
  if (!usaApi("compras")) {
    // La versión simulada recibe el id del usuario
    return mock.misCompras(opciones.usuarioId)
  }
  const { compras } = await api.get("/mis-compras", { signal: opciones.signal })
  return compras.map((c) => compraDesdeApi(c, c.entradas ?? []))
}

/**
 * Lista de ventas (taquillero: las suyas; admin: todas). Se usa en el historial.
 * @param {Object} [opciones]
 * @param {string} [opciones.desde] @param {string} [opciones.hasta]
 * @param {AbortSignal} [opciones.signal]
 */
export async function listarVentas({ desde, hasta, signal } = {}) {
  if (!usaApi("compras")) return mock.listarCompras()
  const params = {}
  if (desde) params.desde = desde
  if (hasta) params.hasta = hasta
  const { ventas } = await api.get("/ventas", { params, signal })
  return ventas.map((v) => compraDesdeApi(v, v.entradas ?? [], v.cliente))
}

export { ApiError }
