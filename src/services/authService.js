/**
 * authService.js — Servicio de autenticación.
 *
 * HOY: Valida contra datos mock en memoria.
 * DESPUÉS: Reemplazar el cuerpo de cada función por llamadas a fetch/axios al backend Flask.
 */

import { simularLatencia } from "./config"
import { USUARIOS_MOCK } from "@/data/usuarios"

// Copia mutable de usuarios (para soportar registro en tiempo de ejecución)
let usuarios = [...USUARIOS_MOCK]

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

  const token = `mock-token-${nuevoUsuario.id}-${Date.now()}`
  const { password: _omitido, ...usuarioSeguro } = nuevoUsuario
  return { usuario: usuarioSeguro, token }
}

/**
 * Obtiene el perfil del usuario autenticado.
 * @param {string} usuarioId
 * @returns {Promise<Object>}
 */
export async function obtenerPerfil(usuarioId) {
  await simularLatencia(300)
  const usuario = usuarios.find((u) => u.id === usuarioId)
  if (!usuario) throw new Error("Usuario no encontrado.")
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
  const { password: _omitido, ...usuarioSeguro } = usuarios[idx]
  return usuarioSeguro
}

/**
 * Obtiene todos los usuarios (solo para administradores).
 * @returns {Promise<Object[]>}
 */
export async function listarUsuarios() {
  await simularLatencia(300)
  return usuarios.map(({ password: _omitido, ...u }) => u)
}
