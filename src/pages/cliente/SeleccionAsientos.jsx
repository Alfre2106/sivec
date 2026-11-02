/**
 * SeleccionAsientos.jsx — Mapa de asientos interactivo.
 * El usuario selecciona sus asientos y luego reserva para pasar al resumen.
 */

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Trash2, Calendar, Clock, MapPin } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/components/ui/Toast"
import { reservarAsientos } from "@/services/asientosService"
import { useFuncion } from "@/hooks/useFuncion"
import { useAuth } from "@/context/AuthContext"
import SeatMap from "@/components/SeatMap"
import Spinner from "@/components/ui/Spinner"
import Button from "@/components/ui/Button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatearPrecio } from "@/utils/formato"

export default function SeleccionAsientos() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { toast } = useToast()
  const { funcionActual, asientosSeleccionados, toggleAsiento, seleccionarFuncion, activarReserva, totalSeleccionado } = useCart()
  const { funcion, asientos, cargando, error } = useFuncion(id)
  const [reservando, setReservando] = useState(false)

  // Si llega directo por URL sin pasar por la cartelera, cargamos la función
  useEffect(() => {
    if (funcion && (!funcionActual || funcionActual.id !== id)) {
      seleccionarFuncion(funcion)
    }
  }, [funcion, funcionActual, id, seleccionarFuncion])

  // Verificar si la función ya inició
  const yaInicio = funcion && new Date(funcion.fechaHora) <= new Date()
  const cancelada = funcion?.estado === "cancelada"

  const manejarReservar = async () => {
    if (asientosSeleccionados.length === 0) {
      toast({ tipo: "advertencia", titulo: "Selecciona al menos un asiento" })
      return
    }
    setReservando(true)
    try {
      const resultado = await reservarAsientos(
        id,
        asientosSeleccionados.map((a) => a.id),
        usuario?.id ?? "anonimo"
      )
      activarReserva({ asientoIds: asientosSeleccionados.map((a) => a.id), expira: resultado.expira })
      navigate("/resumen")
    } catch (err) {
      toast({ tipo: "error", titulo: "Asiento no disponible", mensaje: err.message })
    } finally {
      setReservando(false)
    }
  }

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Cargando sala..." /></div>
  if (error)   return <div className="text-center py-20 text-error font-cuerpo">{error}</div>
  if (!funcion) return null

  const f = funcion

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Alertas de bloqueo */}
      {(yaInicio || cancelada) && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-sivec px-5 py-4 text-red-700 font-cuerpo text-sm">
          {cancelada ? "⚠️ Esta función fue cancelada. No se pueden vender entradas." : "⚠️ Esta función ya inició o finalizó. No se pueden vender entradas."}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Mapa */}
        <div>
          {/* Info de la función */}
          <div className="flex flex-wrap items-start gap-4 mb-6">
            <img
              src={f.pelicula?.poster}
              alt={f.pelicula?.titulo}
              className="w-16 rounded-lg object-cover object-top hidden sm:block shrink-0"
            />
            <div>
              <h1 className="font-titulo font-bold text-xl text-gray-900">{f.pelicula?.titulo}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 font-cuerpo">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" aria-hidden="true" />{format(new Date(f.fechaHora), "d 'de' MMMM yyyy", { locale: es })}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" aria-hidden="true" />{format(new Date(f.fechaHora), "h:mm a", { locale: es })}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" aria-hidden="true" />{f.sala?.nombre}</span>
              </div>
            </div>
          </div>

          <div className="tarjeta p-5">
            <SeatMap
              asientos={asientos}
              seleccionados={asientosSeleccionados.map((a) => a.id)}
              onToggle={toggleAsiento}
              deshabilitado={yaInicio || cancelada || reservando}
            />
          </div>
        </div>

        {/* Panel lateral */}
        <div className="flex flex-col gap-4">
          <div className="tarjeta p-5 flex flex-col gap-4 sticky top-20">
            <h2 className="font-titulo font-bold text-gray-900">Tus asientos</h2>

            {asientosSeleccionados.length === 0 ? (
              <p className="text-gray-400 text-sm font-cuerpo">Haz clic en un asiento disponible</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {asientosSeleccionados.map((a) => (
                  <li key={a.id} className="flex items-center justify-between bg-primario-suave rounded-lg px-3 py-2">
                    <span className="font-titulo font-bold text-primario">{a.codigo}</span>
                    <button
                      onClick={() => toggleAsiento(a)}
                      className="text-gray-400 hover:text-error transition-colors"
                      aria-label={`Quitar asiento ${a.codigo}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {asientosSeleccionados.length > 0 && (
              <div className="border-t border-gray-100 pt-3 flex flex-col gap-1 text-sm font-cuerpo">
                <div className="flex justify-between text-gray-500">
                  <span>{asientosSeleccionados.length} asiento{asientosSeleccionados.length > 1 ? "s" : ""}</span>
                  <span>{formatearPrecio(f.precio)} c/u</span>
                </div>
                <div className="flex justify-between font-titulo font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span className="text-primario">{formatearPrecio(totalSeleccionado)}</span>
                </div>
              </div>
            )}

            <Button
              onClick={manejarReservar}
              cargando={reservando}
              disabled={asientosSeleccionados.length === 0 || yaInicio || cancelada}
              className="w-full"
            >
              Continuar →
            </Button>
            <Button variante="fantasma" tamaño="sm" onClick={() => navigate(-1)}>
              ← Volver
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
