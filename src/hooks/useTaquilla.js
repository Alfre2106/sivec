/**
 * useTaquilla.js — Estado local del flujo de venta en taquilla (4 pasos).
 * Se usa dentro de VentaTaquilla.jsx para mantener el wizard limpio.
 */

import { useState } from "react"

export const PASOS = ["Función", "Asientos", "Cliente", "Confirmar"]

export function useTaquilla() {
  const [paso,        setPaso]        = useState(0)           // 0-3
  const [funcion,     setFuncion]     = useState(null)        // función seleccionada
  const [asientos,    setAsientos]    = useState([])          // asientos seleccionados
  const [cliente,     setCliente]     = useState({ nombre: "", documento: "", contacto: "" })
  const [metodoPago,  setMetodoPago]  = useState("efectivo")  // efectivo por defecto
  const [procesando,  setProcesando]  = useState(false)
  const [compraFinal, setCompraFinal] = useState(null)        // resultado del paso 4

  const irPaso  = (n) => setPaso(n)
  const avanzar = ()  => setPaso((p) => Math.min(p + 1, PASOS.length - 1))
  const retroceder = () => setPaso((p) => Math.max(p - 1, 0))

  const reiniciar = () => {
    setPaso(0)
    setFuncion(null)
    setAsientos([])
    setCliente({ nombre: "", documento: "", contacto: "" })
    setMetodoPago("efectivo")
    setCompraFinal(null)
  }

  return {
    paso, irPaso, avanzar, retroceder, reiniciar,
    funcion,   setFuncion,
    asientos,  setAsientos,
    cliente,   setCliente,
    metodoPago, setMetodoPago,
    procesando, setProcesando,
    compraFinal, setCompraFinal,
  }
}
