/**
 * SeleccionAsientos.jsx — Mapa de asientos interactivo.
 *
 * El mapa viene de la API y se refresca solo cada 5 s (ver useFuncion). El usuario
 * elige asientos y al pulsar "Continuar" se reservan (5 min) y pasa al resumen.
 *
 * Sin sesión: "Continuar" recuerda la función y los asientos elegidos, manda al login
 * y, al volver, restaura esa misma selección para reservar.
 */

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Trash2, Calendar, Clock, MapPin, WifiOff } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/components/ui/Toast"
import { reservarAsientos } from "@/services/asientosService"
import { ApiError } from "@/services/apiClient"
import { useFuncion } from "@/hooks/useFuncion"
import { useAuth } from "@/context/AuthContext"
import SeatMap from "@/components/SeatMap"
import Spinner from "@/components/ui/Spinner"
import Button from "@/components/ui/Button"
import MensajeError from "@/components/ui/MensajeError"
import Poster from "@/components/Poster"
import AvisoDisponibilidad from "@/components/AvisoDisponibilidad"
import { formatearDiaFechaLarga, formatearHora } from "@/utils/fechas"
import { formatearPrecio } from "@/utils/formato"
import { guardarSeleccionPendiente, tomarSeleccionPendiente } from "@/utils/seleccionPendiente"

export default function SeleccionAsientos() {
  const { id: idUrl } = useParams()
  // El id de la función es numérico en la API; si la URL trae basura, no se consulta nada
  const id = Number(idUrl)
  const idValido = Number.isInteger(id) && id > 0
  const navigate = useNavigate()
  const { usuario, autenticado } = useAuth()
  const { toast } = useToast()
  const {
    funcionActual, asientosSeleccionados, toggleAsiento, fijarSeleccion, quitarAsientos,
    seleccionarFuncion, activarReserva, totalSeleccionado,
  } = useCart()
  const { funcion, asientos, cargando, error, sinConexion, refrescar, refrescarAsientos } =
    useFuncion(idValido ? id : undefined)
  const [reservando, setReservando] = useState(false)

  // Si llega directo por URL sin pasar por la cartelera, fija la función en el carrito
  useEffect(() => {
    if (funcion && funcionActual?.id !== funcion.id) {
      seleccionarFuncion(funcion)
    }
  }, [funcion, funcionActual, seleccionarFuncion])

  // Al volver del login, restaurar los asientos que el usuario había elegido
  useEffect(() => {
    if (!funcion || asientos.length === 0) return
    const pendientes = tomarSeleccionPendiente(id)
    if (!pendientes?.length) return
    const disponibles = asientos.filter((a) => pendientes.includes(a.id) && a.estado === "disponible")
    if (disponibles.length) {
      fijarSeleccion(disponibles)
      if (disponibles.length < pendientes.length) {
        toast({ tipo: "advertencia", titulo: "Algunos asientos ya no estaban libres", mensaje: "Revisamos tu selección." })
      }
    } else {
      toast({ tipo: "advertencia", titulo: "Tus asientos ya no estaban disponibles", mensaje: "Elígelos de nuevo." })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funcion, asientos, id])

  // Verificar si la función ya inició
  const yaInicio = !!funcion && (new Date(funcion.fechaHora) <= new Date() || funcion.estado === "finalizada")
  const cancelada = funcion?.estado === "cancelada"

  /** Quita de la selección los asientos que el mapa ya no muestra como disponibles. */
  const sincronizarSeleccionConMapa = (mapa) => {
    const ocupados = asientosSeleccionados
      .filter((sel) => {
        const a = mapa.find((x) => x.id === sel.id)
        return !a || a.estado !== "disponible"
      })
      .map((a) => a.id)
    if (ocupados.length) quitarAsientos(ocupados)
  }

  const manejarReservar = async () => {
    if (asientosSeleccionados.length === 0) {
      toast({ tipo: "advertencia", titulo: "Selecciona al menos un asiento" })
      return
    }
    // Sin sesión: recordar la selección y mandar al login (vuelve a esta misma pantalla)
    if (!autenticado) {
      guardarSeleccionPendiente(id, asientosSeleccionados.map((a) => a.id))
      toast({ tipo: "info", titulo: "Inicia sesión para continuar", mensaje: "Guardamos tu selección." })
      navigate("/login", { state: { desde: { pathname: `/funcion/${id}/asientos` } } })
      return
    }

    setReservando(true)
    try {
      const { segundosRestantes, venceEn } = await reservarAsientos(
        id,
        asientosSeleccionados.map((a) => a.id),
        usuario?.id
      )
      activarReserva({
        asientoIds: asientosSeleccionados.map((a) => a.id),
        segundosRestantes,
        venceEn,
      })
      navigate("/resumen")
    } catch (err) {
      await manejarErrorReserva(err)
    } finally {
      setReservando(false)
    }
  }

  /** Traduce los errores de la reserva a avisos y refresca el mapa cuando hace falta. */
  const manejarErrorReserva = async (err) => {
    const codigo = err instanceof ApiError ? err.codigo : null
    if (codigo === "ASIENTO_NO_DISPONIBLE") {
      toast({ tipo: "error", titulo: "Alguien tomó ese asiento", mensaje: "Actualizamos el mapa; elige otros." })
      const mapa = await refrescarAsientos()
      if (mapa) sincronizarSeleccionConMapa(mapa)
      return
    }
    if (codigo === "FUNCION_NO_DISPONIBLE") {
      toast({ tipo: "error", titulo: "Función no disponible", mensaje: err.mensaje })
      refrescar()
      return
    }
    if (codigo === "LIMITE_RESERVAS") {
      toast({ tipo: "advertencia", titulo: "Demasiadas reservas", mensaje: err.mensaje })
      return
    }
    toast({ tipo: "error", titulo: "No se pudo reservar", mensaje: err.mensaje ?? err.message })
  }

  if (!idValido) return <MensajeError mensaje="La función que buscas no existe." onReintentar={() => navigate("/cartelera")} />
  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Cargando sala..." /></div>
  if (error)   return <MensajeError mensaje={error} onReintentar={refrescar} />
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

      {/* Aviso de que el mapa dejó de actualizarse (fallo de conexión en el refresco) */}
      {sinConexion && !yaInicio && !cancelada && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-sivec px-5 py-3 text-amber-800 font-cuerpo text-sm flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
          No pudimos actualizar el mapa. Puede estar desactualizado; reintentando…
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Mapa */}
        <div>
          {/* Info de la función */}
          <div className="flex flex-wrap items-start gap-4 mb-6">
            <Poster
              src={f.pelicula?.poster}
              alt={f.pelicula?.titulo}
              className="w-16 rounded-lg object-cover object-top hidden sm:block shrink-0"
            />
            <div>
              <h1 className="font-titulo font-bold text-xl text-gray-900">{f.pelicula?.titulo}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 font-cuerpo">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" aria-hidden="true" />{formatearDiaFechaLarga(f.fechaHora)}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" aria-hidden="true" />{formatearHora(f.fechaHora)}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" aria-hidden="true" />{f.sala?.nombre}</span>
                <AvisoDisponibilidad disponibles={f.asientosDisponibles} />
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
