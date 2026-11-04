/**
 * useFuncion.js — Hook para cargar los datos de una función y su mapa de asientos.
 *
 * Fase I2: la función viene de la API; los asientos siguen simulados.
 * - La carga normal trae función + asientos.
 * - El polling (cada 5 s) refresca solo los asientos y, si falla, no tumba la pantalla.
 * - Se cancela lo pendiente al cambiar de función o desmontar.
 * (La Fase I3 reescribe este hook para usar los asientos reales de la API.)
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { obtenerFuncion } from "@/services/funcionesService"
import { obtenerAsientos } from "@/services/asientosService"
import { fueCancelada, mensajeDeError } from "@/services/apiClient"

const INTERVALO_POLLING_MS = 5000

/**
 * @param {number|string|undefined} funcionId
 * @returns {{ funcion, asientos, cargando, error, refrescar }}
 */
export function useFuncion(funcionId) {
  const [funcion,   setFuncion]   = useState(null)
  const [asientos,  setAsientos]  = useState([])
  const [cargando,  setCargando]  = useState(false)
  const [error,     setError]     = useState(null)
  const ctrlRef = useRef(null)

  const cargar = useCallback(async (silencioso = false) => {
    if (funcionId === undefined || funcionId === null) return
    ctrlRef.current?.abort()
    const ctrl = new AbortController()
    ctrlRef.current = ctrl

    if (!silencioso) {
      setCargando(true)
      setError(null)
    }
    try {
      if (silencioso) {
        setAsientos(await obtenerAsientos(funcionId))
      } else {
        const f = await obtenerFuncion(funcionId, { signal: ctrl.signal })
        const a = await obtenerAsientos(funcionId)
        if (ctrl.signal.aborted) return
        setFuncion(f)
        setAsientos(a)
      }
    } catch (e) {
      if (fueCancelada(e) || ctrl.signal.aborted) return
      if (!silencioso) setError(mensajeDeError(e, "No pudimos cargar la función."))
    } finally {
      if (!silencioso && !ctrl.signal.aborted) setCargando(false)
    }
  }, [funcionId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFuncion(null)
    setAsientos([])
    cargar()
    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") cargar(true)
    }, INTERVALO_POLLING_MS)
    return () => {
      clearInterval(intervalo)
      ctrlRef.current?.abort()
    }
  }, [cargar])

  return { funcion, asientos, cargando, error, refrescar: () => cargar() }
}
