/**
 * useFuncion.js — Carga una función y su mapa de asientos, y mantiene el mapa al día.
 *
 * - Carga inicial: función + asientos (con estados de carga y error).
 * - Refresco automático del mapa cada 5 s, SIN solapar peticiones: si la anterior
 *   sigue en curso, ese ciclo se omite.
 * - Pausado mientras la pestaña está oculta; al volver a verse refresca de inmediato.
 * - Un fallo de refresco no tumba la pantalla: mantiene el último mapa y marca `sinConexion`.
 * - Al cambiar de función o desmontar: cancela lo pendiente (AbortController) y limpia el intervalo.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { obtenerFuncion } from "@/services/funcionesService"
import { obtenerAsientos } from "@/services/asientosService"
import { fueCancelada, mensajeDeError } from "@/services/apiClient"

export const INTERVALO_REFRESCO_MS = 5000

/**
 * @param {number|string|undefined} funcionId — undefined = no consulta nada
 * @returns {{ funcion, asientos, cargando, error, sinConexion, refrescar, refrescarAsientos }}
 */
export function useFuncion(funcionId) {
  const [funcion,     setFuncion]     = useState(null)
  const [asientos,    setAsientos]    = useState([])
  const [cargando,    setCargando]    = useState(funcionId !== undefined)
  const [error,       setError]       = useState(null)
  const [sinConexion, setSinConexion] = useState(false)

  const controlador = useRef(null)   // petición en curso (carga o refresco)
  const enCurso     = useRef(false)  // ¿hay una petición en vuelo?

  /** Carga completa: función + mapa. */
  const cargar = useCallback(async () => {
    if (funcionId === undefined || funcionId === null) return
    controlador.current?.abort()
    const ctrl = new AbortController()
    controlador.current = ctrl
    enCurso.current = true
    setCargando(true)
    setError(null)
    try {
      const [f, a] = await Promise.all([
        obtenerFuncion(funcionId, { signal: ctrl.signal }),
        obtenerAsientos(funcionId, { signal: ctrl.signal }),
      ])
      if (ctrl.signal.aborted) return
      setFuncion(f)
      setAsientos(a)
      setSinConexion(false)
    } catch (e) {
      if (fueCancelada(e) || ctrl.signal.aborted) return
      setError(mensajeDeError(e, "No pudimos cargar la función."))
    } finally {
      if (controlador.current === ctrl) {
        enCurso.current = false
        setCargando(false)
      }
    }
  }, [funcionId])

  /** Refresca solo el mapa. Devuelve la lista nueva (o null si se omitió o falló). */
  const refrescarAsientos = useCallback(async () => {
    if (funcionId === undefined || funcionId === null) return null
    if (enCurso.current) return null            // no solapar peticiones
    const ctrl = new AbortController()
    controlador.current = ctrl
    enCurso.current = true
    try {
      const a = await obtenerAsientos(funcionId, { signal: ctrl.signal })
      if (ctrl.signal.aborted) return null
      setAsientos(a)
      setSinConexion(false)
      return a
    } catch (e) {
      if (fueCancelada(e) || ctrl.signal.aborted) return null
      setSinConexion(true)
      return null
    } finally {
      if (controlador.current === ctrl) enCurso.current = false
    }
  }, [funcionId])

  useEffect(() => {
    // Nueva función: se parte de cero
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFuncion(null)
    setAsientos([])
    setSinConexion(false)
    cargar()

    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") refrescarAsientos()
    }, INTERVALO_REFRESCO_MS)

    const alVolverAVer = () => {
      if (document.visibilityState === "visible") refrescarAsientos()
    }
    document.addEventListener("visibilitychange", alVolverAVer)

    return () => {
      clearInterval(intervalo)
      document.removeEventListener("visibilitychange", alVolverAVer)
      controlador.current?.abort()
      enCurso.current = false
    }
  }, [cargar, refrescarAsientos])

  return { funcion, asientos, cargando, error, sinConexion, refrescar: cargar, refrescarAsientos }
}
