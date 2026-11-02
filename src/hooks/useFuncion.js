/**
 * useFuncion.js — Hook para cargar los datos de una función y su mapa de asientos.
 * Implementa polling cada 5 segundos para refrescar el estado de los asientos.
 */

import { useEffect, useRef, useState } from "react"
import { obtenerFuncion } from "@/services/funcionesService"
import { obtenerAsientos } from "@/services/asientosService"

const INTERVALO_POLLING_MS = 5000

/**
 * @param {string|undefined} funcionId
 * @returns {{ funcion, asientos, cargando, error, refrescar }}
 */
export function useFuncion(funcionId) {
  const [funcion,   setFuncion]   = useState(null)
  const [asientos,  setAsientos]  = useState([])
  const [cargando,  setCargando]  = useState(false)
  const [error,     setError]     = useState(null)
  const pollingRef = useRef(null)

  const cargar = async (silencioso = false) => {
    if (!funcionId) return
    if (!silencioso) setCargando(true)
    setError(null)
    try {
      const [f, a] = await Promise.all([
        obtenerFuncion(funcionId),
        obtenerAsientos(funcionId),
      ])
      setFuncion(f)
      setAsientos(a)
    } catch (e) {
      setError(e.message)
    } finally {
      if (!silencioso) setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
    // Polling: refresca asientos en silencio cada 5 s
    pollingRef.current = setInterval(() => cargar(true), INTERVALO_POLLING_MS)
    return () => clearInterval(pollingRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funcionId])

  return { funcion, asientos, cargando, error, refrescar: () => cargar() }
}
