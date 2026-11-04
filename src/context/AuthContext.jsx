/**
 * AuthContext.jsx — Contexto global de la sesión.
 *
 * Provee: usuario, token, rol, autenticado, login, registrar, logout, y el estado de
 * la validación de la sesión guardada (cargandoSesion, errorSesion, reintentarSesion).
 *
 * Cómo funciona la sesión:
 *  - El token se guarda en localStorage (lo gestiona apiClient: fijarToken / obtenerToken).
 *  - Al cargar la app, si hay token se valida con GET /auth/yo. El usuario y su ROL salen
 *    de esa respuesta del servidor, nunca de lo que haya guardado el navegador.
 *  - Mientras se valida, cargandoSesion es true (ProtectedRoute y Navbar esperan).
 *  - Si el servidor responde 401 (token vencido o inválido), se cierra la sesión: durante
 *    la validación inicial es silencioso; a mitad de uso avisa con un Toast y envía al
 *    login recordando la ruta para volver a ella después.
 *  - Si no se pudo validar por falla de conexión o error 5xx, NO se cierra la sesión:
 *    se ofrece reintentar (errorSesion).
 *
 * Debe montarse dentro de <BrowserRouter> y de <ToastProvider>.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import * as authService from "@/services/authService"
import {
  ApiError,
  fijarToken,
  mensajeDeError,
  obtenerToken,
  registrarManejadorNoAutorizado,
} from "@/services/apiClient"
import { useToast } from "@/components/ui/Toast"

// ── Creación del contexto ────────────────────────────────────────────────────
const AuthContext = createContext(null)

/** ¿El fallo es temporal (sin conexión o error del servidor)? Entonces no se cierra la sesión. */
const esFalloTemporal = (e) => e instanceof ApiError && (e.status === 0 || e.status >= 500)

// ── Proveedor ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(() => obtenerToken())
  // Si hay un token guardado, la sesión está "por validar" desde el primer render
  const [cargandoSesion, setCargandoSesion] = useState(() => Boolean(obtenerToken()))
  const [errorSesion, setErrorSesion] = useState(null)

  const [cargando, setCargando] = useState(false) // login o registro en curso
  const [error, setError] = useState(null)

  // navigate cambia de identidad al navegar: se guarda en un ref para no volver a
  // registrar el manejador del 401 en cada cambio de ruta
  const navigateRef = useRef(navigate)
  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  // true solo mientras se valida la sesión guardada (un 401 ahí no debe avisar ni redirigir)
  const validandoRef = useRef(false)

  // ── Validación de la sesión guardada ─────────────────────────────────────
  /**
   * @param {() => boolean} esVigente — false si el efecto fue reemplazado (StrictMode, desmontaje);
   *   así una respuesta tardía no pisa el estado de una validación más nueva.
   */
  const validar = useCallback(async (esVigente) => {
    validandoRef.current = true
    try {
      const u = await authService.validarSesion()
      if (!esVigente()) return
      if (u.activo === false) {
        // Cuenta desactivada: no se deja entrar
        fijarToken(null)
        setToken(null)
        setUsuario(null)
        return
      }
      setUsuario(u)
      setToken(obtenerToken())
    } catch (e) {
      if (!esVigente()) return
      if (esFalloTemporal(e)) {
        setErrorSesion(e)
      } else {
        // 401 u otro rechazo: la sesión guardada ya no sirve
        fijarToken(null)
        setToken(null)
        setUsuario(null)
      }
    } finally {
      if (esVigente()) {
        validandoRef.current = false
        setCargandoSesion(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!obtenerToken()) return
    let vigente = true
    validar(() => vigente)
    return () => {
      vigente = false
    }
  }, [validar])

  /** Reintenta validar la sesión después de una falla de conexión. */
  const reintentarSesion = useCallback(() => {
    setErrorSesion(null)
    setCargandoSesion(true)
    validar(() => true)
  }, [validar])

  // ── 401 en cualquier petición con sesión activa ──────────────────────────
  useEffect(
    () =>
      registrarManejadorNoAutorizado(() => {
        // apiClient ya borró el token; aquí se limpia el estado de React
        setUsuario(null)
        setToken(null)
        if (validandoRef.current) return // al cargar la app: silencioso

        toast({
          tipo: "advertencia",
          titulo: "Tu sesión expiró",
          mensaje: "Inicia sesión de nuevo para continuar.",
        })
        const { pathname, search, hash } = window.location
        if (pathname !== "/login" && pathname !== "/registro") {
          navigateRef.current("/login", {
            replace: true,
            state: { desde: { pathname, search, hash } }, // el login vuelve a esta ruta
          })
        }
      }),
    [toast]
  )

  // ── Acciones ─────────────────────────────────────────────────────────────

  /** Guarda la sesión recién iniciada (login o registro). */
  const iniciarSesion = useCallback((resultado) => {
    fijarToken(resultado.token)
    setToken(resultado.token)
    setUsuario(resultado.usuario)
    setErrorSesion(null)
    setCargandoSesion(false)
  }, [])

  /**
   * Inicia sesión con correo y contraseña.
   * @returns {Promise<Object>} el usuario autenticado (con el rol que dice el servidor)
   * @throws {ApiError} para que el formulario muestre el mensaje
   */
  const login = useCallback(
    async (email, password) => {
      setCargando(true)
      setError(null)
      try {
        const resultado = await authService.login(email, password)
        iniciarSesion(resultado)
        return resultado.usuario
      } catch (err) {
        setError(mensajeDeError(err, err?.message))
        throw err
      } finally {
        setCargando(false)
      }
    },
    [iniciarSesion]
  )

  /**
   * Registra un cliente nuevo y deja la sesión iniciada.
   * @param {Object} datos — { nombre, email, password, telefono?, documento? }
   * @returns {Promise<Object>} el usuario creado
   * @throws {ApiError}
   */
  const registrar = useCallback(
    async (datos) => {
      setCargando(true)
      setError(null)
      try {
        const resultado = await authService.registrar(datos)
        iniciarSesion(resultado)
        return resultado.usuario
      } catch (err) {
        setError(mensajeDeError(err, err?.message))
        throw err
      } finally {
        setCargando(false)
      }
    },
    [iniciarSesion]
  )

  /** Cierra la sesión: borra el token y el usuario. */
  const logout = useCallback(() => {
    fijarToken(null)
    setToken(null)
    setUsuario(null)
    setError(null)
    setErrorSesion(null)
  }, [])

  /** Limpia el error manualmente (útil para resetear formularios). */
  const limpiarError = useCallback(() => setError(null), [])

  // useMemo: el contexto cambia solo cuando cambia algo de la sesión, no en cada navegación
  const valor = useMemo(
    () => ({
      usuario,
      token,
      rol: usuario?.rol ?? null,
      autenticado: Boolean(usuario),
      cargandoSesion,
      errorSesion,
      reintentarSesion,
      cargando,
      error,
      login,
      registrar,
      logout,
      limpiarError,
    }),
    [usuario, token, cargandoSesion, errorSesion, reintentarSesion, cargando, error, login, registrar, logout, limpiarError]
  )

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
