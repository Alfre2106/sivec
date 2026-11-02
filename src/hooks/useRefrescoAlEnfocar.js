/**
 * useRefrescoAlEnfocar.js — Ejecuta un callback cuando la ventana recupera
 * el foco o la pestaña vuelve a ser visible.
 *
 * Sirve para que una página (ej: Cartelera del cliente) vuelva a consultar
 * los servicios y refleje cambios hechos en otra pestaña/panel (ej: el admin
 * cambió un precio) sin necesidad de recargar manualmente.
 *
 * Uso:
 *   useRefrescoAlEnfocar(() => cargarDatos())
 */

import { useEffect } from "react"

/**
 * @param {() => void} callback — función a ejecutar al recuperar el foco
 */
export function useRefrescoAlEnfocar(callback) {
  useEffect(() => {
    const manejar = () => {
      if (document.visibilityState === "visible") callback()
    }
    window.addEventListener("focus", callback)
    document.addEventListener("visibilitychange", manejar)
    return () => {
      window.removeEventListener("focus", callback)
      document.removeEventListener("visibilitychange", manejar)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
