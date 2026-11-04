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

import { useEffect, useRef } from "react"

/**
 * @param {() => void} callback — función a ejecutar al recuperar el foco
 *   (se usa siempre la versión más reciente, sin re-suscribir los listeners)
 */
export function useRefrescoAlEnfocar(callback) {
  const ultimo = useRef(callback)
  useEffect(() => { ultimo.current = callback })

  useEffect(() => {
    const alEnfocar = () => ultimo.current()
    const manejar = () => {
      if (document.visibilityState === "visible") ultimo.current()
    }
    window.addEventListener("focus", alEnfocar)
    document.addEventListener("visibilitychange", manejar)
    return () => {
      window.removeEventListener("focus", alEnfocar)
      document.removeEventListener("visibilitychange", manejar)
    }
  }, [])
}
