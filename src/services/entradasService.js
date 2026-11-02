/**
 * entradasService.js — Servicio de validación de entradas.
 *
 * Reglas de negocio:
 *  - Una entrada solo puede usarse una vez (estado: "activa" → "usada")
 *  - Si la función fue cancelada, la entrada está "anulada"
 *  - El código QR contiene el código único de la entrada
 *
 * HOY: Opera en la misma referencia de compras (mismo módulo en memoria).
 * DESPUÉS: Endpoint POST /entradas/validar en Flask.
 */

import { simularLatencia } from "./config"
import { listarCompras, persistirCambios } from "./comprasService"
import { obtenerFuncion } from "./funcionesService"

/**
 * Resultado de validación de entrada.
 * @typedef {Object} ResultadoValidacion
 * @property {"valida"|"ya_usada"|"invalida"|"anulada"} estado
 * @property {string} mensaje
 * @property {Object|null} entrada — datos de la entrada si se encontró
 * @property {Object|null} funcion — datos de la función
 * @property {Object|null} compra  — datos de la compra
 */

/**
 * Valida una entrada por su código (escaneado en QR o ingresado manual).
 * Actualiza el estado a "usada" si es válida.
 *
 * @param {string} codigo — Código único de la entrada (ej: "SVC-2024-000001")
 * @param {string} [funcionIdActual] — Si se pasa, verifica que pertenezca a esta función
 * @returns {Promise<ResultadoValidacion>}
 */
export async function validarEntrada(codigo, funcionIdActual = null) {
  await simularLatencia(400)

  const compras = await listarCompras()

  // Buscar la entrada en todas las compras
  let entradaEncontrada = null
  let compraEncontrada = null

  for (const compra of compras) {
    const entrada = compra.entradas?.find((e) => e.codigo === codigo)
    if (entrada) {
      entradaEncontrada = entrada
      compraEncontrada = compra
      break
    }
  }

  // Código inexistente
  if (!entradaEncontrada) {
    return {
      estado: "invalida",
      mensaje: "Código de entrada no encontrado en el sistema.",
      entrada: null,
      funcion: null,
      compra: null,
    }
  }

  // Obtener datos de la función
  let funcion = null
  try {
    funcion = await obtenerFuncion(compraEncontrada.funcionId)
  } catch {
    // La función puede haberse eliminado del mock
  }

  // Entrada anulada (función cancelada)
  if (entradaEncontrada.estado === "anulada") {
    return {
      estado: "anulada",
      mensaje: "Esta entrada fue anulada porque la función fue cancelada.",
      entrada: entradaEncontrada,
      funcion,
      compra: compraEncontrada,
    }
  }

  // Entrada ya usada
  if (entradaEncontrada.estado === "usada") {
    return {
      estado: "ya_usada",
      mensaje: `Esta entrada ya fue usada el ${new Date(entradaEncontrada.fechaUso).toLocaleString("es-CO")}.`,
      entrada: entradaEncontrada,
      funcion,
      compra: compraEncontrada,
    }
  }

  // Verificar que pertenece a la función correcta (si se indicó)
  if (funcionIdActual && compraEncontrada.funcionId !== funcionIdActual) {
    const funcionCorrecta = funcion
    return {
      estado: "invalida",
      mensaje: `Esta entrada pertenece a otra función: "${funcionCorrecta?.pelicula?.titulo ?? compraEncontrada.funcionId}".`,
      entrada: entradaEncontrada,
      funcion,
      compra: compraEncontrada,
    }
  }

  // ✅ Entrada válida — marcarla como usada y persistir
  entradaEncontrada.estado = "usada"
  entradaEncontrada.fechaUso = new Date().toISOString()
  persistirCambios()

  return {
    estado: "valida",
    mensaje: "¡Entrada válida! Acceso permitido.",
    entrada: entradaEncontrada,
    funcion,
    compra: compraEncontrada,
  }
}
