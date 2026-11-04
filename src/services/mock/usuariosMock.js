/**
 * usuariosMock.js — Implementación SIMULADA de autenticación y gestión de usuarios.
 *
 * Es la lógica que antes vivía en authService.js, movida aquí sin cambios de comportamiento
 * (más validarSesion). La usan:
 *   - authService.js      cuando el servicio "auth" no usa la API (ver usaApi en config.js)
 *   - usuariosService.js  hasta que se migre a la API (Fase I6)
 *
 * Los datos viven en localStorage (almacenamiento.js) e incluyen contraseñas en claro:
 * es solo para la demostración con datos simulados.
 */

import { simularLatencia } from "../config"
import { USUARIOS_MOCK } from "@/data/usuarios"
import { cargar, guardar } from "../almacenamiento"

// Usuarios persistidos en localStorage
let usuarios = cargar("usuarios", () => USUARIOS_MOCK.map((u) => ({ ...u })))

const persistir = () => guardar("usuarios", usuarios)

// ── Autenticación ────────────────────────────────────────────────────────────

/**
 * Inicia sesión con email y contraseña.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{usuario: Object, token: string}>}
 * @throws {Error} Si las credenciales son incorrectas
 */
export async function login(email, password) {
  await simularLatencia(500)

  const usuario = usuarios.find(
    (u) => u.email === email && u.password === password && u.activo
  )

  if (!usuario) {
    throw new Error("Correo o contraseña incorrectos.")
  }

  // Token simulado (en producción vendría del backend JWT)
  const token = `mock-token-${usuario.id}-${Date.now()}`

  // Retornamos el usuario sin la contraseña
  const { password: _omitido, ...usuarioSeguro } = usuario
  return { usuario: usuarioSeguro, token }
}

/**
 * Registra un nuevo usuario cliente.
 * @param {Object} datos — { nombre, email, password, telefono, documento }
 * @returns {Promise<{usuario: Object, token: string}>}
 * @throws {Error} Si el email ya está registrado
 */
export async function registrar(datos) {
  await simularLatencia(600)

  const existe = usuarios.find((u) => u.email === datos.email)
  if (existe) {
    throw new Error("El correo ya está registrado.")
  }

  const nuevoUsuario = {
    id: `u${Date.now()}`,
    rol: "cliente",
    activo: true,
    fechaRegistro: new Date().toISOString(),
    ...datos,
  }

  usuarios.push(nuevoUsuario)
  persistir()

  const token = `mock-token-${nuevoUsuario.id}-${Date.now()}`
  const { password: _omitido, ...usuarioSeguro } = nuevoUsuario
  return { usuario: usuarioSeguro, token }
}

/**
 * Valida la sesión guardada y devuelve el usuario (equivale a GET /auth/yo).
 * El token simulado tiene la forma "mock-token-<idUsuario>-<marca de tiempo>".
 * @param {string|null} token
 * @returns {Promise<Object>}
 * @throws {Error} Si el token no corresponde a un usuario activo
 */
export async function validarSesion(token) {
  await simularLatencia(200)
  const coincidencia = /^mock-token-(.+)-\d+$/.exec(token ?? "")
  const usuario = coincidencia && usuarios.find((u) => String(u.id) === coincidencia[1] && u.activo)
  if (!usuario) throw new Error("Sesión no válida.")
  const { password: _omitido, ...usuarioSeguro } = usuario
  return usuarioSeguro
}

/**
 * Actualiza los datos del perfil.
 * @param {string} usuarioId
 * @param {Object} datos
 * @returns {Promise<Object>}
 */
export async function actualizarPerfil(usuarioId, datos) {
  await simularLatencia(400)
  const idx = usuarios.findIndex((u) => u.id === usuarioId)
  if (idx === -1) throw new Error("Usuario no encontrado.")
  usuarios[idx] = { ...usuarios[idx], ...datos }
  persistir()
  const { password: _omitido, ...usuarioSeguro } = usuarios[idx]
  return usuarioSeguro
}

// ── Gestión de usuarios (administrador) ──────────────────────────────────────

/**
 * Obtiene todos los usuarios (solo para administradores).
 * @returns {Promise<Object[]>}
 */
export async function listarUsuarios() {
  await simularLatencia(300)
  return usuarios.map(({ password: _omitido, ...u }) => u)
}

/**
 * Crea un usuario con rol (solo admin).
 * @param {Object} datos — { nombre, email, password, rol, telefono }
 */
export async function crearUsuario(datos) {
  await simularLatencia(400)
  if (usuarios.find((u) => u.email === datos.email)) {
    throw new Error("El correo ya está registrado.")
  }
  const nuevo = {
    id: `u${Date.now()}`,
    activo: true,
    fechaRegistro: new Date().toISOString(),
    password: datos.password ?? "123456",
    ...datos,
  }
  usuarios.push(nuevo)
  persistir()
  const { password: _o, ...seguro } = nuevo
  return seguro
}

/**
 * Actualiza los datos de un usuario (rol, estado, nombre...) — admin.
 * @param {string} id
 * @param {Object} datos
 */
export async function actualizarUsuario(id, datos) {
  await simularLatencia(350)
  const idx = usuarios.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error("Usuario no encontrado.")
  usuarios[idx] = { ...usuarios[idx], ...datos }
  persistir()
  const { password: _o, ...seguro } = usuarios[idx]
  return seguro
}

/**
 * Activa/desactiva un usuario (toggle).
 * @param {string} id
 */
export async function alternarActivoUsuario(id) {
  await simularLatencia(250)
  const idx = usuarios.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error("Usuario no encontrado.")
  usuarios[idx].activo = !usuarios[idx].activo
  persistir()
  const { password: _o, ...seguro } = usuarios[idx]
  return seguro
}

/**
 * Elimina un usuario por su ID (solo admin).
 * @param {string} id
 */
export async function eliminarUsuario(id) {
  await simularLatencia(300)
  const existe = usuarios.some((u) => u.id === id)
  if (!existe) throw new Error("Usuario no encontrado.")
  usuarios = usuarios.filter((u) => u.id !== id)
  persistir()
}
