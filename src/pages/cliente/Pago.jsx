/**
 * Pago.jsx — Formulario de pago SIMULADO.
 * Tarjeta falsa con opción de simular pago rechazado.
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CreditCard, Lock, CheckCircle2, XCircle } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/components/ui/Toast"
import { crearCompra, ApiError } from "@/services/comprasService"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { formatearPrecio } from "@/utils/formato"

// Formatea número de tarjeta: 1234 5678 9012 3456
const formatNumero = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
const formatExpiry = (v) => {
  const digits = v.replace(/\D/g, "").slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0,2)}/${digits.slice(2)}` : digits
}

export default function Pago() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { funcionActual, asientosSeleccionados, totalSeleccionado, confirmarCompra, reserva, limpiarCarrito } = useCart()

  const [form, setForm]       = useState({ numero: "", nombre: "", expiry: "", cvv: "" })
  const [errores, setErrores] = useState({})
  const [procesando, setProcesando] = useState(false)
  const [simularRechazo, setSimularRechazo] = useState(false)
  const [resultado, setResultado] = useState(null) // "exito" | "rechazado"

  // Redirigir si no hay reserva — PERO no cuando el pago ya fue exitoso
  // (tras el éxito el carrito se limpia y estaría vacío a propósito).
  if ((!funcionActual || !reserva) && resultado !== "exito") {
    navigate("/cartelera", { replace: true })
    return null
  }

  const cambiar = (campo) => (e) => {
    let val = e.target.value
    if (campo === "numero") val = formatNumero(val)
    if (campo === "expiry") val = formatExpiry(val)
    if (campo === "cvv")    val = val.replace(/\D/g, "").slice(0, 4)
    setForm((f) => ({ ...f, [campo]: val }))
    setErrores((err) => ({ ...err, [campo]: "" }))
  }

  /**
   * Valida el vencimiento "MM/AA":
   *  - formato completo (5 caracteres)
   *  - mes entre 01 y 12
   *  - que no esté vencida (compara con el mes/año actual)
   * @returns {string|null} mensaje de error o null si es válida
   */
  const validarVencimiento = (expiry) => {
    if (expiry.length < 5) return "Formato MM/AA incompleto"
    const [mesStr, añoStr] = expiry.split("/")
    const mes = Number(mesStr)
    const año = Number(añoStr)

    if (Number.isNaN(mes) || Number.isNaN(año)) return "Fecha inválida"
    if (mes < 1 || mes > 12) return "El mes debe estar entre 01 y 12"

    // Año de 2 dígitos → 20XX. Comparar con fin del mes de vencimiento.
    const añoCompleto = 2000 + año
    const ahora = new Date()
    const añoActual = ahora.getFullYear()
    const mesActual = ahora.getMonth() + 1 // 1-12

    if (añoCompleto < añoActual || (añoCompleto === añoActual && mes < mesActual)) {
      return "La tarjeta está vencida"
    }
    // Límite razonable: no más de 15 años a futuro
    if (añoCompleto > añoActual + 15) return "Año de vencimiento no válido"

    return null
  }

  const validar = () => {
    const e = {}
    if (form.numero.replace(/\s/g,"").length < 16) e.numero  = "Número de tarjeta inválido"
    if (!form.nombre.trim())                        e.nombre  = "Nombre requerido"

    const errorExpiry = validarVencimiento(form.expiry)
    if (errorExpiry)                                e.expiry  = errorExpiry

    if (form.cvv.length < 3)                        e.cvv     = "CVV inválido"
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return
    setProcesando(true)
    try {
      const { compra, entradas } = await crearCompra({
        funcionId:      funcionActual.id,
        // Sin asientos: el backend usa mis reservas activas de la Fase I3
        total:          totalSeleccionado,
        metodoPago:     "tarjeta",
        simularRechazo,
      })
      // Marcar éxito ANTES de limpiar el carrito para que la guarda de
      // redirección no se dispare al vaciarse funcionActual/reserva.
      setResultado("exito")
      confirmarCompra(compra)
      setTimeout(() => navigate(`/entrada/${entradas[0].id}`, { state: { compra } }), 1500)
    } catch (err) {
      await manejarErrorPago(err)
    } finally {
      setProcesando(false)
    }
  }

  /** Traduce los errores del pago a avisos y acciones. */
  const manejarErrorPago = async (err) => {
    const codigo = err instanceof ApiError ? err.codigo : null
    if (codigo === "PAGO_RECHAZADO") {
      // La reserva sigue viva: se puede reintentar sin volver a elegir asientos
      setResultado("rechazado")
      toast({ tipo: "error", titulo: "Pago rechazado", mensaje: "No se generaron entradas. Puedes intentarlo de nuevo." })
      return
    }
    if (codigo === "RESERVA_VENCIDA") {
      limpiarCarrito()
      toast({ tipo: "advertencia", titulo: "Tu reserva venció", mensaje: "Vuelve a elegir tus asientos." })
      navigate(`/funcion/${funcionActual.id}/asientos`, { replace: true })
      return
    }
    if (codigo === "ASIENTO_NO_DISPONIBLE" || codigo === "FUNCION_NO_DISPONIBLE") {
      limpiarCarrito()
      toast({ tipo: "error", titulo: "Asientos no disponibles", mensaje: err.mensaje })
      navigate(`/funcion/${funcionActual.id}/asientos`, { replace: true })
      return
    }
    setResultado("rechazado")
    toast({ tipo: "error", titulo: "No se pudo completar el pago", mensaje: err.mensaje ?? err.message })
  }

  // Pantalla de resultado
  if (resultado === "exito") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animacion-entrada">
        <CheckCircle2 className="w-20 h-20 text-exito" aria-hidden="true" />
        <h2 className="font-titulo text-2xl font-bold text-gray-900">¡Pago exitoso!</h2>
        <p className="text-gray-500 font-cuerpo">Redirigiendo a tu entrada...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-degradado-violeta flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-titulo font-bold text-xl text-gray-900">Pago Simulado</h1>
          <p className="text-xs text-gray-500 font-cuerpo flex items-center gap-1">
            <Lock className="w-3 h-3" aria-hidden="true" />
            Sin datos reales — solo para demostración
          </p>
        </div>
      </div>

      {/* Resumen */}
      <div className="tarjeta px-4 py-3 mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-cuerpo">{funcionActual.pelicula?.titulo}</p>
          <p className="font-cuerpo text-sm text-gray-700">{asientosSeleccionados.map((a) => a.codigo).join(", ")}</p>
        </div>
        <span className="font-titulo font-extrabold text-primario text-lg">{formatearPrecio(totalSeleccionado)}</span>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} noValidate className="tarjeta p-6 flex flex-col gap-4">
        <Input
          etiqueta="Número de tarjeta"
          placeholder="1234 5678 9012 3456"
          value={form.numero}
          onChange={cambiar("numero")}
          error={errores.numero}
          inputMode="numeric"
          icono={<CreditCard className="w-4 h-4" />}
        />
        <Input
          etiqueta="Nombre en la tarjeta"
          placeholder="ANA GARCIA"
          value={form.nombre}
          onChange={cambiar("nombre")}
          error={errores.nombre}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            etiqueta="Vencimiento"
            placeholder="MM/AA"
            value={form.expiry}
            onChange={cambiar("expiry")}
            error={errores.expiry}
            inputMode="numeric"
          />
          <Input
            etiqueta="CVV"
            placeholder="123"
            value={form.cvv}
            onChange={cambiar("cvv")}
            error={errores.cvv}
            inputMode="numeric"
            tipo="password"
          />
        </div>

        {/* Toggle de rechazo simulado */}
        <label className="flex items-center gap-3 cursor-pointer mt-1 p-3 rounded-lg border border-dashed border-amber-300 bg-amber-50">
          <input
            type="checkbox"
            checked={simularRechazo}
            onChange={(e) => setSimularRechazo(e.target.checked)}
            className="w-4 h-4 rounded accent-amber-500"
            aria-label="Simular pago rechazado"
          />
          <span className="text-xs font-cuerpo text-amber-700">
            🧪 Simular pago rechazado (prueba)
          </span>
        </label>

        {resultado === "rechazado" && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700 font-cuerpo" role="alert">
            <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            Pago rechazado. Verifica tus datos e intenta de nuevo.
          </div>
        )}

        <Button type="submit" cargando={procesando} className="w-full mt-1">
          {procesando ? "Procesando..." : `Confirmar pago · ${formatearPrecio(totalSeleccionado)}`}
        </Button>
        <Button variante="fantasma" tamaño="sm" type="button" onClick={() => navigate(-1)}>
          ← Volver al resumen
        </Button>
      </form>
    </div>
  )
}
