/**
 * mock/comprasMock.js — Lógica SIMULADA de compras y entradas (sin backend).
 *
 * HOY: Gestiona compras en memoria con datos mock.
 * DESPUÉS: Reemplazar con fetch/axios al backend Flask.
 */

import { simularLatencia, simularError } from "../config"
import { COMPRAS_MOCK, contadorEntradas } from "@/data/compras"
import { confirmarVenta } from "./asientosMock"
import { cargar, guardar } from "../almacenamiento"

// Estado persistido de compras y entradas
let compras  = cargar("compras", () => COMPRAS_MOCK.map((c) => ({ ...c })))
let contador = cargar("contadorEntradas", () => contadorEntradas)

const persistir = () => {
  guardar("compras", compras)
  guardar("contadorEntradas", contador)
}

/**
 * Genera un código único de entrada.
 * @returns {string} Código tipo "SVC-2024-000004"
 */
const generarCodigo = () => {
  const num = String(contador++).padStart(6, "0")
  return `SVC-${new Date().getFullYear()}-${num}`
}

/**
 * Crea una compra nueva y genera las entradas correspondientes.
 * Simula el proceso de pago (con posibilidad de fallo aleatorio).
 *
 * @param {Object} datos
 * @param {string} datos.usuarioId
 * @param {string} datos.funcionId
 * @param {string[]} datos.asientoIds
 * @param {string[]} datos.codigosAsiento — ej: ["A1", "A2"]
 * @param {number} datos.total
 * @param {boolean} datos.simularRechazo — si true, lanza error de pago
 * @returns {Promise<Object>} La compra creada con sus entradas
 */
export async function crearCompra(datos) {
  await simularLatencia(800)

  // Simular fallo de pasarela si se pidió explícitamente
  if (datos.simularRechazo) {
    throw new Error("Pago rechazado. Verifica los datos de tu tarjeta.")
  }

  // Pequeña probabilidad de error aleatorio de red (2%)
  simularError(0.02)

  const entradas = datos.codigosAsiento.map((codigo, i) => ({
    id: `e${Date.now()}-${i}`,
    compraId: null,       // se asigna después
    asiento: codigo,
    asientoId: datos.asientoIds[i],
    codigo: generarCodigo(),
    estado: "activa",
    fechaUso: null,
  }))

  const compra = {
    id: `c${Date.now()}`,
    usuarioId: datos.usuarioId,
    funcionId: datos.funcionId,
    asientos: datos.asientoIds,
    total: datos.total,
    metodoPago: "tarjeta",
    fechaCompra: new Date().toISOString(),
    estado: "confirmada",
    entradas: entradas.map((e) => ({ ...e, compraId: `c${Date.now()}` })),
    // Datos de cliente (para venta de taquilla)
    clienteNombre: datos.clienteNombre ?? null,
    clienteDocumento: datos.clienteDocumento ?? null,
  }

  compras.push(compra)
  persistir()

  // Marcar los asientos como vendidos en el servicio de asientos
  await confirmarVenta(datos.funcionId, datos.asientoIds)

  return compra
}

/**
 * Obtiene las compras de un usuario específico.
 * @param {string} usuarioId
 * @returns {Promise<Object[]>}
 */
export async function misCompras(usuarioId) {
  await simularLatencia(300)
  return compras.filter((c) => c.usuarioId === usuarioId)
}

/**
 * Obtiene una compra por ID.
 * @param {string} compraId
 * @returns {Promise<Object>}
 */
export async function obtenerCompra(compraId) {
  await simularLatencia(200)
  const compra = compras.find((c) => c.id === compraId)
  if (!compra) throw new Error("Compra no encontrada.")
  return compra
}

/**
 * Lista todas las compras (para historial del taquillero y admin).
 * @returns {Promise<Object[]>}
 */
export async function listarCompras() {
  await simularLatencia(300)
  return [...compras]
}

/**
 * Persiste cambios hechos sobre las entradas (ej: validación → "usada").
 * La llama entradasService después de mutar el estado de una entrada.
 */
export function persistirCambios() {
  persistir()
}
