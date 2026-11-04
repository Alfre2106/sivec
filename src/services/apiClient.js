/**
 * apiClient.js — Cliente HTTP único hacia la API real de SIVEC.
 *
 * Es la ÚNICA pieza del proyecto que llama a fetch. Los servicios (src/services/*)
 * lo usan; los componentes nunca. Se encarga de:
 *  - URL base (VITE_API_URL) y parámetros de consulta
 *  - Cabecera Authorization: Bearer <token>
 *  - Cuerpo y respuesta JSON (o blob para descargas, ej: CSV de reportes)
 *  - Errores uniformes: todo fallo se lanza como ApiError { codigo, mensaje, status, detalle }
 *  - Cancelación con AbortController y tiempo máximo de espera
 *  - Sesión vencida: ante un 401 con token enviado, borra el token y avisa al AuthContext
 *
 * Uso típico en un servicio:
 *   const { peliculas } = await api.get("/peliculas", { signal })
 *   const datos = await api.post("/auth/login", { correo, password }, { auth: false })
 */

import { API_BASE_URL } from "./config"

const CLAVE_TOKEN = "sivec_token"
const TIEMPO_MAXIMO_MS = 15000

// ── Errores ──────────────────────────────────────────────────────────────────

/**
 * Error de la API. La API responde {"error": {"codigo", "mensaje", "detalle"}};
 * aquí se convierte en un error de JavaScript normal.
 *
 * Códigos propios del cliente (cuando no hubo respuesta del servidor, status 0):
 *   ERROR_RED, TIEMPO_AGOTADO
 */
export class ApiError extends Error {
  /**
   * @param {Object} datos
   * @param {string} datos.codigo         — código estable (ej: "ASIENTO_NO_DISPONIBLE")
   * @param {string} datos.mensaje        — texto en español, presentable al usuario
   * @param {number} datos.status         — código HTTP (0 si no hubo respuesta)
   * @param {Object|null} [datos.detalle] — datos extra de la API (ej: asientos_no_disponibles)
   */
  constructor({ codigo, mensaje, status, detalle = null }) {
    super(mensaje)
    this.name = "ApiError"
    this.codigo = codigo
    this.mensaje = mensaje
    this.status = status
    this.detalle = detalle
  }
}

const MENSAJE_RED = "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo."
const MENSAJE_TIEMPO = "El servidor tardó demasiado en responder. Revisa tu conexión e inténtalo de nuevo."

// La API devuelve estos dos mensajes en inglés; se muestran en español.
const MENSAJES_EN_ESPANOL = {
  NOT_FOUND: "El recurso solicitado no existe.",
  METHOD_NOT_ALLOWED: "Operación no permitida.",
}

/** Mensaje genérico cuando la respuesta de error no trae el formato de la API. */
function mensajePorStatus(status) {
  if (status === 401) return "Tu sesión no es válida. Inicia sesión de nuevo."
  if (status === 403) return "No tienes permisos para realizar esta acción."
  if (status === 404) return "El recurso solicitado no existe."
  if (status >= 500) return "El servidor no pudo procesar la solicitud. Inténtalo de nuevo más tarde."
  return "No se pudo completar la solicitud."
}

/** True si el fallo fue de conexión (sin respuesta del servidor). */
export const esErrorDeRed = (e) =>
  e instanceof ApiError && (e.codigo === "ERROR_RED" || e.codigo === "TIEMPO_AGOTADO")

/** True si la petición fue cancelada con AbortController (no se debe mostrar como error). */
export const fueCancelada = (e) => e?.name === "AbortError"

/** Texto listo para un Toast: el mensaje de la API o uno genérico. */
export function mensajeDeError(e, porDefecto = "Ocurrió un error inesperado. Inténtalo de nuevo.") {
  return e instanceof ApiError ? e.mensaje : porDefecto
}

// ── Sesión (token) ───────────────────────────────────────────────────────────

function leerTokenGuardado() {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

// El token vive en memoria (rápido) y se respalda en localStorage (sobrevive a recargas).
let tokenActual = leerTokenGuardado()

/** Token de la sesión actual, o null. */
export const obtenerToken = () => tokenActual

/**
 * Guarda (o borra, si es null) el token de la sesión.
 * Lo llama el AuthContext al iniciar y cerrar sesión.
 * @param {string|null} token
 */
export function fijarToken(token) {
  tokenActual = token || null
  try {
    if (tokenActual) localStorage.setItem(CLAVE_TOKEN, tokenActual)
    else localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    // Sin localStorage el token vive solo en memoria
  }
}

let manejadorNoAutorizado = null

/**
 * Registra qué hacer cuando el servidor responde 401 a una sesión activa
 * (token vencido o inválido). El AuthContext cierra la sesión y redirige al login.
 * Devuelve una función para anular el registro (útil en useEffect).
 * @param {(error: ApiError) => void} fn
 * @returns {() => void}
 */
export function registrarManejadorNoAutorizado(fn) {
  manejadorNoAutorizado = fn
  return () => {
    if (manejadorNoAutorizado === fn) manejadorNoAutorizado = null
  }
}

// ── Utilidades internas ──────────────────────────────────────────────────────

/** Arma la URL final; ignora parámetros vacíos (undefined, null o ""). */
function construirUrl(ruta, params) {
  const consulta = new URLSearchParams()
  for (const [clave, valor] of Object.entries(params ?? {})) {
    if (valor === undefined || valor === null || valor === "") continue
    consulta.append(clave, String(valor))
  }
  const texto = consulta.toString()
  const rutaNormalizada = ruta.startsWith("/") ? ruta : `/${ruta}`
  return `${API_BASE_URL}${rutaNormalizada}${texto ? `?${texto}` : ""}`
}

/** Convierte una respuesta HTTP de error en ApiError. */
async function errorDeRespuesta(res) {
  let cuerpo = null
  try {
    cuerpo = JSON.parse(await res.text())
  } catch {
    // Cuerpo vacío o que no es JSON (ej: página de error de un proxy)
  }

  const error = cuerpo?.error
  if (error && typeof error === "object") {
    const codigo = String(error.codigo ?? `HTTP_${res.status}`)
    return new ApiError({
      codigo,
      mensaje: MENSAJES_EN_ESPANOL[codigo] ?? error.mensaje ?? mensajePorStatus(res.status),
      status: res.status,
      detalle: error.detalle ?? null,
    })
  }

  return new ApiError({
    codigo: `HTTP_${res.status}`,
    mensaje: mensajePorStatus(res.status),
    status: res.status,
  })
}

/** Lee el cuerpo JSON de una respuesta exitosa (null si viene vacío). */
async function leerJson(res) {
  const texto = await res.text()
  if (!texto) return null
  try {
    return JSON.parse(texto)
  } catch {
    throw new ApiError({
      codigo: "RESPUESTA_INVALIDA",
      mensaje: "El servidor devolvió una respuesta inesperada.",
      status: res.status,
    })
  }
}

/** Extrae el nombre del archivo de la cabecera Content-Disposition (o null). */
function nombreDeArchivo(res) {
  const cabecera = res.headers.get("Content-Disposition") ?? ""
  const coincidencia = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cabecera)
  if (!coincidencia) return null
  try {
    return decodeURIComponent(coincidencia[1])
  } catch {
    return coincidencia[1]
  }
}

/** Unifica los fallos de fetch: red caída, tiempo agotado o cancelación. */
function normalizarError(e, { tiempoAgotado, canceladoPorLlamador }) {
  if (e instanceof ApiError) return e
  // Cancelación pedida por quien llamó: se relanza tal cual (AbortError) para que la ignore
  if (canceladoPorLlamador) return e
  if (tiempoAgotado) return new ApiError({ codigo: "TIEMPO_AGOTADO", mensaje: MENSAJE_TIEMPO, status: 0 })
  return new ApiError({ codigo: "ERROR_RED", mensaje: MENSAJE_RED, status: 0 })
}

// ── Núcleo ───────────────────────────────────────────────────────────────────

/**
 * @param {"GET"|"POST"|"PUT"|"DELETE"} metodo
 * @param {string} ruta                    — empieza con "/" (ej: "/peliculas")
 * @param {Object}  [opciones]
 * @param {Object}  [opciones.params]      — parámetros de consulta (?a=1&b=2)
 * @param {*}       [opciones.cuerpo]      — se envía como JSON
 * @param {AbortSignal} [opciones.signal]  — para cancelar (mapa de asientos, desmontajes)
 * @param {boolean} [opciones.auth=true]   — false = no enviar el token (login y registro)
 * @param {"json"|"blob"} [opciones.respuesta="json"]
 */
async function peticion(metodo, ruta, { params, cuerpo, signal, auth = true, respuesta = "json" } = {}) {
  const tokenEnviado = auth ? tokenActual : null

  const cabeceras = { Accept: respuesta === "json" ? "application/json" : "*/*" }
  if (tokenEnviado) cabeceras.Authorization = `Bearer ${tokenEnviado}`

  let body
  if (cuerpo !== undefined) {
    cabeceras["Content-Type"] = "application/json"
    body = JSON.stringify(cuerpo)
  }

  // Controlador propio: une la cancelación del llamador con el tiempo máximo de espera
  const controlador = new AbortController()
  let tiempoAgotado = false
  const temporizador = setTimeout(() => {
    tiempoAgotado = true
    controlador.abort()
  }, TIEMPO_MAXIMO_MS)
  const cancelarPorLlamador = () => controlador.abort()
  if (signal?.aborted) controlador.abort()
  else signal?.addEventListener("abort", cancelarPorLlamador, { once: true })

  try {
    const res = await fetch(construirUrl(ruta, params), {
      method: metodo,
      headers: cabeceras,
      body,
      signal: controlador.signal,
    })

    if (!res.ok) {
      const error = await errorDeRespuesta(res)
      // 401 con sesión activa: token vencido o inválido. Se compara con el token actual
      // para que la respuesta tardía de una sesión anterior no cierre la sesión nueva,
      // y para avisar una sola vez aunque fallen varias peticiones en paralelo.
      if (res.status === 401 && tokenEnviado && tokenEnviado === tokenActual) {
        fijarToken(null)
        manejadorNoAutorizado?.(error)
      }
      throw error
    }

    if (respuesta === "blob") {
      return { blob: await res.blob(), nombreArchivo: nombreDeArchivo(res) }
    }
    return await leerJson(res)
  } catch (e) {
    throw normalizarError(e, { tiempoAgotado, canceladoPorLlamador: signal?.aborted })
  } finally {
    clearTimeout(temporizador)
    signal?.removeEventListener("abort", cancelarPorLlamador)
  }
}

/**
 * Métodos de la API. Todos devuelven una promesa y, si algo falla, lanzan ApiError
 * (o AbortError si el llamador canceló con su signal).
 */
export const api = {
  get: (ruta, opciones) => peticion("GET", ruta, opciones),
  post: (ruta, cuerpo, opciones) => peticion("POST", ruta, { ...opciones, cuerpo }),
  put: (ruta, cuerpo, opciones) => peticion("PUT", ruta, { ...opciones, cuerpo }),
  del: (ruta, opciones) => peticion("DELETE", ruta, opciones),
  /** Descarga un archivo con el token (ej: CSV). Devuelve { blob, nombreArchivo }. */
  descargar: (ruta, opciones) => peticion("GET", ruta, { ...opciones, respuesta: "blob" }),
}
