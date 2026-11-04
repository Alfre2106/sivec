/**
 * usuariosService.js — Gestión de usuarios (solo administrador).
 *
 * Con usaApi("usuarios") usa la API real (GET/POST/PUT/DELETE /usuarios); si no, la
 * lógica simulada de mock/usuariosMock.js. Reutiliza los mapeadores de authService para
 * que la interfaz siga trabajando con el rol "admin" y el campo "email".
 *
 * La API solo crea taquilleros y administradores; DELETE desactiva (no borra). Los usuarios
 * no tienen teléfono ni documento (se quitaron del panel en la Fase I6).
 *
 * Forma de usuario para la interfaz: { id, nombre, email, rol, activo, clienteId, fechaRegistro }
 */

import { usaApi } from "./config"
import { api } from "./apiClient"
import { rolHaciaApi, usuarioDesdeApi } from "./authService"
import * as mock from "./mock/usuariosMock"

/**
 * Lista usuarios, opcionalmente filtrando por rol.
 * @param {Object} [opciones]
 * @param {"cliente"|"taquillero"|"admin"} [opciones.rol]
 * @param {AbortSignal} [opciones.signal]
 * @returns {Promise<Object[]>}
 */
export async function listarUsuarios({ rol, signal } = {}) {
  if (!usaApi("usuarios")) return mock.listarUsuarios()
  const params = {}
  if (rol) params.rol = rolHaciaApi(rol)
  const { usuarios } = await api.get("/usuarios", { params, signal })
  return usuarios.map(usuarioDesdeApi)
}

/**
 * Crea un taquillero o administrador.
 * @param {{nombre, email, password, rol}} datos — rol en forma de interfaz ("admin"/"taquillero")
 * @throws {ApiError} 409 CORREO_YA_REGISTRADO, 422 (CAMPOS_REQUERIDOS, CORREO_INVALIDO, etc.)
 */
export async function crearUsuario(datos) {
  if (!usaApi("usuarios")) return mock.crearUsuario(datos)
  const { usuario } = await api.post("/usuarios", {
    nombre: datos.nombre,
    correo: datos.email,
    password: datos.password,
    rol: rolHaciaApi(datos.rol),
  })
  return usuarioDesdeApi(usuario)
}

/**
 * Actualiza un usuario (edición parcial: nombre, correo, rol, password, activo).
 * @param {string|number} id
 * @param {Object} datos — campos en forma de interfaz
 * @throws {ApiError} 404 USUARIO_NO_ENCONTRADO, 409 CORREO_YA_REGISTRADO, 422
 */
export async function actualizarUsuario(id, datos) {
  if (!usaApi("usuarios")) return mock.actualizarUsuario(id, datos)
  const cuerpo = {}
  if (datos.nombre !== undefined) cuerpo.nombre = datos.nombre
  if (datos.email !== undefined) cuerpo.correo = datos.email
  if (datos.rol !== undefined) cuerpo.rol = rolHaciaApi(datos.rol)
  if (datos.password) cuerpo.password = datos.password
  if (datos.activo !== undefined) cuerpo.activo = datos.activo
  const { usuario } = await api.put(`/usuarios/${encodeURIComponent(id)}`, cuerpo)
  return usuarioDesdeApi(usuario)
}

/**
 * Desactiva un usuario (DELETE = activo:false). Devuelve el usuario ya desactivado.
 * @throws {ApiError} 404 USUARIO_NO_ENCONTRADO
 */
export async function desactivarUsuario(id) {
  if (!usaApi("usuarios")) return mock.actualizarUsuario(id, { activo: false })
  const { usuario } = await api.del(`/usuarios/${encodeURIComponent(id)}`)
  return usuarioDesdeApi(usuario)
}

/**
 * Reactiva un usuario (PUT activo:true).
 * @throws {ApiError} 404 USUARIO_NO_ENCONTRADO
 */
export async function activarUsuario(id) {
  if (!usaApi("usuarios")) return mock.actualizarUsuario(id, { activo: true })
  return actualizarUsuario(id, { activo: true })
}
