/**
 * CartContext.jsx — Contexto global del carrito de compra de asientos.
 *
 * Gestiona:
 *  - Asientos seleccionados (temporalmente) antes de reservar
 *  - La reserva activa (con su TTL y función asociada)
 *  - La compra confirmada (para mostrar en la pantalla de éxito)
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

// ── Creación del contexto ────────────────────────────────────────────────────
const CartContext = createContext(null)

// ── Proveedor ────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  // Asientos que el usuario tiene seleccionados visualmente (pre-reserva)
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([])

  // Datos de la función actual que se está comprando
  const [funcionActual, setFuncionActual] = useState(null)

  // Reserva activa: { asientoIds, expira: Date } | null
  const [reserva, setReserva] = useState(null)

  // Segundos restantes de la reserva
  const [segundosRestantes, setSegundosRestantes] = useState(0)

  // Referencia al intervalo del countdown
  const intervalRef = useRef(null)

  // Compra confirmada (después del pago exitoso)
  const [compraConfirmada, setCompraConfirmada] = useState(null)

  // ── Countdown de reserva ─────────────────────────────────────────────────

  const detenerCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const iniciarCountdown = useCallback(
    (expira) => {
      detenerCountdown()
      const calcularSegundos = () => {
        const diff = Math.max(0, Math.floor((expira.getTime() - Date.now()) / 1000))
        setSegundosRestantes(diff)
        if (diff === 0) detenerCountdown()
      }
      calcularSegundos()
      intervalRef.current = setInterval(calcularSegundos, 1000)
    },
    [detenerCountdown]
  )

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return detenerCountdown
  }, [detenerCountdown])

  // ── Acciones del carrito ─────────────────────────────────────────────────

  /**
   * Agrega o quita un asiento de la selección visual.
   * @param {Object} asiento — datos del asiento
   */
  const toggleAsiento = useCallback((asiento) => {
    setAsientosSeleccionados((prev) => {
      const existe = prev.find((a) => a.id === asiento.id)
      if (existe) return prev.filter((a) => a.id !== asiento.id)
      return [...prev, asiento]
    })
  }, [])

  /** Reemplaza la selección completa (ej: al restaurarla tras iniciar sesión). */
  const fijarSeleccion = useCallback((asientos) => {
    setAsientosSeleccionados(asientos)
  }, [])

  /** Quita de la selección los asientos con esos ids (ej: otro cliente los tomó). */
  const quitarAsientos = useCallback((ids) => {
    const set = new Set(ids)
    setAsientosSeleccionados((prev) => prev.filter((a) => !set.has(a.id)))
  }, [])

  /**
   * Establece la función actualmente en proceso de compra.
   * @param {Object} funcion
   */
  const seleccionarFuncion = useCallback((funcion) => {
    setFuncionActual(funcion)
    setAsientosSeleccionados([])
    setReserva(null)
    setSegundosRestantes(0)
  }, [])

  /**
   * Activa la reserva. El tiempo lo manda el servidor: `segundosRestantes`
   * (preferido) y/o `venceEn`. La expiración se calcula desde `segundosRestantes`
   * para no depender del reloj del navegador.
   * @param {{ asientoIds: Array<number|string>, segundosRestantes?: number, venceEn?: string|null, expira?: Date }} datosReserva
   */
  const activarReserva = useCallback(
    (datosReserva) => {
      const expira = datosReserva.expira
        ?? (typeof datosReserva.segundosRestantes === "number"
          ? new Date(Date.now() + datosReserva.segundosRestantes * 1000)
          : datosReserva.venceEn ? new Date(datosReserva.venceEn) : new Date())
      setReserva({ asientoIds: datosReserva.asientoIds, expira })
      iniciarCountdown(expira)
    },
    [iniciarCountdown]
  )

  /** Limpia todo el estado del carrito (tras compra exitosa o cancelación). */
  const limpiarCarrito = useCallback(() => {
    setAsientosSeleccionados([])
    setFuncionActual(null)
    setReserva(null)
    setSegundosRestantes(0)
    detenerCountdown()
  }, [detenerCountdown])

  /**
   * Confirma la compra y guarda los datos para mostrar en la pantalla de éxito.
   * @param {Object} compra
   */
  const confirmarCompra = useCallback(
    (compra) => {
      setCompraConfirmada(compra)
      limpiarCarrito()
    },
    [limpiarCarrito]
  )

  /** Limpia la compra confirmada (después de que el usuario la vea). */
  const limpiarCompraConfirmada = useCallback(() => {
    setCompraConfirmada(null)
  }, [])

  // Total de la compra basado en los asientos seleccionados
  const totalSeleccionado = funcionActual
    ? asientosSeleccionados.length * (funcionActual.precio ?? funcionActual.precioBase ?? 0)
    : 0

  const valor = {
    asientosSeleccionados,
    funcionActual,
    reserva,
    segundosRestantes,
    reservaExpirada: reserva !== null && segundosRestantes === 0,
    compraConfirmada,
    totalSeleccionado,
    toggleAsiento,
    fijarSeleccion,
    quitarAsientos,
    seleccionarFuncion,
    activarReserva,
    limpiarCarrito,
    confirmarCompra,
    limpiarCompraConfirmada,
  }

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>
}

// ── Hook de acceso ───────────────────────────────────────────────────────────
/**
 * Hook para consumir el contexto del carrito.
 * @returns {Object} El valor del CartContext
 * @throws {Error} Si se usa fuera del CartProvider
 */
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de <CartProvider>")
  }
  return ctx
}
