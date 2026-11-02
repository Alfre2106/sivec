/**
 * ErrorBoundary.jsx — Captura errores de renderizado de React para evitar
 * que la app quede en blanco. Muestra una pantalla amable con opción de recargar.
 */

import { Component } from "react"

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { tieneError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { tieneError: true, error }
  }

  componentDidCatch(error, info) {
    // En producción aquí se enviaría a un servicio de logs (Sentry, etc.)
    console.error("ErrorBoundary capturó un error:", error, info)
  }

  manejarRecargar = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.tieneError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-fondo p-6">
          <div className="bg-white rounded-sivec shadow-tarjeta border border-gray-100 p-10 text-center max-w-md w-full">
            <div className="text-5xl mb-4" aria-hidden="true">🎬</div>
            <h1 className="font-titulo text-2xl font-bold text-gray-900 mb-2">
              Ups, algo falló
            </h1>
            <p className="text-gray-500 font-cuerpo text-sm mb-6">
              Ocurrió un error inesperado. Puedes volver al inicio e intentarlo de nuevo.
            </p>
            <button onClick={this.manejarRecargar} className="btn-primario">
              Volver al inicio
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
