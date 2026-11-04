/**
 * authService.js — Sesión: login, registro de clientes y validación de la sesión guardada.
 *
 * Usa la API real (POST /auth/login, POST /auth/registro, GET /auth/yo) cuando
 * usaApi("auth") es true; si no, la lógica simulada de mock/usuariosMock.js.
 * Los componentes siempre reciben la MISMA forma de usuario (la que ya usaban):
 *
 *   { id, nombre, email, rol, activo, clienteId, fechaRegistro }
 *
 * La API devuelve { id, nombre, correo, rol, activo, cliente_id, creado_en }; los
 * mapeadores de abajo hacen la traducción. Esta es la ÚNICA parte del frontend que
 * convierte el rol entre la API ("administrador") y la interfaz ("admin").
 *
 * La gestión de usuarios para el administrador está en usuariosService.js.
 * El perfil es de solo lectura: la API no tiene endpoint para editarlo.
 */

import { usaApi } from "./config"
import { api, obtenerToken } from "./apiClient"
import * as mock from "./mock/usuariosMock"

// ── Mapeadores (API ⇄ interfaz) ──────────────────────────────────────────────

/** Rol de la API → rol de la interfaz: "administrador" pasa a "admin". */
export const rolDesdeApi = (rol) => (rol === "administrador" ? "admin" : rol)

/** Rol de la interfaz → rol de la API: "admin" pasa a "administrador". */
export const rolHaciaApi = (rol) => (rol === "admin" ? "administrador" : rol)

/**
 * Usuario de la API → usuario de la interfaz.
 * La API no entrega teléfono ni documento del usuario (viven en la ficha de cliente).
 * @param {Object} u
 */
export function usuarioDesdeApi(u) {
  return {
    id: u.id,
    nombre: u.nombre,
    email: u.correo,
    rol: rolDesdeApi(u.rol),
    activo: u.activo,
    clienteId: u.cliente_id ?? null,
    fechaRegistro: u.creado_en ?? null,
  }
}

/** Texto opcional: devuelve el texto sin espacios sobrantes, o undefined si quedó vacío. */
const textoOpcional = (valor) => {
  const texto = typeof valor === "string" ? valor.trim() : ""
  return texto || undefined
}

// ── API pública del servicio ─────────────────────────────────────────────────

/**
 * Inicia sesión.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ usuario: Object, token: string }>}
 * @throws {ApiError} 401 CREDENCIALES_INVALIDAS o USUARIO_INACTIVO; 422 CAMPOS_REQUERIDOS
 */
export async function login(email, password) {
  if (!usaApi("auth")) return mock.login(email, password)

  // La API normaliza el correo (mayúsculas y espacios); solo se recorta aquí
  const { token, usuario } = await api.post(
    "/auth/login",
    { correo: String(email ?? "").trim(), password },
    { auth: false }
  )
  return { usuario: usuarioDesdeApi(usuario), token }
}

/**
 * Registra un cliente nuevo y deja la sesión iniciada.
 * El rol siempre es "cliente" (la API ignora cualquier otro).
 *
 * @param {Object} datos — { nombre, email, password, telefono?, documento? }
 *   `telefono` viaja como `contacto`; ambos opcionales se envían solo si traen texto.
 * @returns {Promise<{ usuario: Object, token: string }>}
 * @throws {ApiError} 409 CORREO_YA_REGISTRADO; 422 CORREO_INVALIDO, PASSWORD_CORTA, PASSWORD_LARGA
 */
export async function registrar(datos) {
  if (!usaApi("auth")) return mock.registrar(datos)

  const cuerpo = {
    nombre: String(datos.nombre ?? "").trim(),
    correo: String(datos.email ?? "").trim(),
    password: datos.password,
    documento: textoOpcional(datos.documento),
    contacto: textoOpcional(datos.contacto ?? datos.telefono),
  }
  const { token, usuario } = await api.post("/auth/registro", cuerpo, { auth: false })
  return { usuario: usuarioDesdeApi(usuario), token }
}

/**
 * Valida la sesión guardada (GET /auth/yo) y devuelve el usuario con el ROL QUE
 * DICE EL SERVIDOR. Se llama al cargar la app si hay un token guardado.
 * @param {Object} [opciones]
 * @param {AbortSignal} [opciones.signal]
 * @returns {Promise<Object>}
 * @throws {ApiError} 401 si el token venció o no es válido
 */
export async function validarSesion({ signal } = {}) {
  if (!usaApi("auth")) return mock.validarSesion(obtenerToken())

  const { usuario } = await api.get("/auth/yo", { signal })
  return usuarioDesdeApi(usuario)
}
