/**
 * AuthContext.jsx — Contexto global de autenticación.
 *
 * Provee: usuario, token, rol, funciones login/logout/registrar.
 * Persiste la sesión en sessionStorage (se borra al cerrar el navegador).
 */

import { createContext, useContext, useEffect, useState } from "react"
import * as authService from "@/services/authService"

// ── Creación del contexto ────────────────────────────────────────────────────
const AuthContext = createContext(null)

// Clave usada en sessionStorage
const STORAGE_KEY = "sivec_sesion"

// ── Proveedor ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Estado inicial: intentar recuperar sesión guardada
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = sessionStorage.getItem(STORAGE_KEY)
      return guardado ? JSON.parse(guardado).usuario : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    try {
      const guardado = sessionStorage.getItem(STORAGE_KEY)
      return guardado ? JSON.parse(guardado).token : null
    } catch {
      return null
    }
  })

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  // Persiste la sesión cuando cambia el usuario
  useEffect(() => {
    if (usuario && token) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ usuario, token }))
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [usuario, token])

  /**
   * Inicia sesión con email y contraseña.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} El usuario autenticado
   */
  const login = async (email, password) => {
    setCargando(true)
    setError(null)
    try {
      const resultado = await authService.login(email, password)
      setUsuario(resultado.usuario)
      setToken(resultado.token)
      return resultado.usuario
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setCargando(false)
    }
  }

  /**
   * Registra un nuevo cliente.
   * @param {Object} datos
   * @returns {Promise<Object>} El usuario creado
   */
  const registrar = async (datos) => {
    setCargando(true)
    setError(null)
    try {
      const resultado = await authService.registrar(datos)
      setUsuario(resultado.usuario)
      setToken(resultado.token)
      return resultado.usuario
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setCargando(false)
    }
  }

  /** Cierra la sesión y limpia el estado. */
  const logout = () => {
    setUsuario(null)
    setToken(null)
    setError(null)
  }

  /** Limpia el error manualmente (útil para resetear formularios). */
  const limpiarError = () => setError(null)

  const valor = {
    usuario,
    token,
    rol: usuario?.rol ?? null,
    autenticado: !!usuario,
    cargando,
    error,
    login,
    registrar,
    logout,
    limpiarError,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// ── Hook de acceso ───────────────────────────────────────────────────────────
/**
 * Hook para consumir el contexto de autenticación.
 * @returns {Object} El valor del AuthContext
 * @throws {Error} Si se usa fuera del AuthProvider
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  }
  return ctx
}
