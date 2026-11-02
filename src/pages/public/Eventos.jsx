/**
 * Eventos.jsx — Agenda de funciones próximas (vista pública).
 *
 * A diferencia de la Cartelera (que agrupa por película), esta vista ordena
 * TODAS las funciones activas y futuras por fecha, agrupadas por día, como
 * una agenda de eventos. Reutiliza los servicios existentes.
 */

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Clock, MapPin, CalendarDays } from "lucide-react"
import { listarFunciones } from "@/services/funcionesService"
import { useCart } from "@/context/CartContext"
import { useRefrescoAlEnfocar } from "@/hooks/useRefrescoAlEnfocar"
import Spinner from "@/components/ui/Spinner"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import EstadoVacio from "@/components/ui/EstadoVacio"
import MensajeError from "@/components/ui/MensajeError"
import { format, isToday, isTomorrow } from "date-fns"
import { es } from "date-fns/locale"
import { formatearPrecio } from "@/utils/formato"

/** Devuelve una etiqueta amigable para el día: "Hoy", "Mañana" o la fecha. */
function etiquetaDia(fecha) {
  if (isToday(fecha)) return "Hoy"
  if (isTomorrow(fecha)) return "Mañana"
  return format(fecha, "EEEE d 'de' MMMM", { locale: es })
}

export default function Eventos() {
  const navigate = useNavigate()
  const { seleccionarFuncion } = useCart()

  const [funciones, setFunciones] = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)

  const cargar = () => {
    setCargando(true)
    setError(null)
    listarFunciones()
      .then((data) => {
        // Ordenar por fecha ascendente
        setFunciones([...data].sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)))
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])
  useRefrescoAlEnfocar(cargar)

  const irAAsientos = (funcion) => {
    seleccionarFuncion(funcion)
    navigate(`/funcion/${funcion.id}/asientos`)
  }

  // Agrupar funciones por día (clave = fecha YYYY-MM-DD)
  const porDia = funciones.reduce((acc, f) => {
    const clave = format(new Date(f.fechaHora), "yyyy-MM-dd")
    ;(acc[clave] ??= []).push(f)
    return acc
  }, {})
  const dias = Object.keys(porDia).sort()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-primario-suave flex items-center justify-center">
          <CalendarDays className="w-6 h-6 text-primario" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-titulo text-3xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-500 font-cuerpo text-sm">Agenda de próximas funciones ordenadas por día</p>
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Cargando agenda..." /></div>
      ) : error ? (
        <MensajeError mensaje={error} onReintentar={cargar} />
      ) : dias.length === 0 ? (
        <EstadoVacio
          icono={<CalendarDays />}
          titulo="Sin eventos próximos"
          descripcion="No hay funciones programadas por ahora. Vuelve pronto."
        >
          <Button onClick={() => navigate("/cartelera")}>Ver cartelera</Button>
        </EstadoVacio>
      ) : (
        <div className="flex flex-col gap-8 mt-8">
          {dias.map((dia) => {
            const fecha = new Date(dia + "T00:00:00")
            return (
              <section key={dia} aria-label={`Funciones del ${etiquetaDia(fecha)}`}>
                {/* Cabecera del día */}
                <div className="flex items-center gap-3 mb-4 sticky top-16 bg-fondo/90 backdrop-blur-sm py-2 z-10">
                  <h2 className="font-titulo font-bold text-gray-900 capitalize">
                    {etiquetaDia(fecha)}
                  </h2>
                  <div className="flex-1 h-px bg-gray-200" aria-hidden="true" />
                  <Badge variante="neutro">{porDia[dia].length} función{porDia[dia].length !== 1 ? "es" : ""}</Badge>
                </div>

                {/* Lista de funciones del día */}
                <div className="flex flex-col gap-3">
                  {porDia[dia].map((f) => (
                    <div
                      key={f.id}
                      className="tarjeta p-4 flex items-center gap-4 hover:shadow-boton transition-shadow"
                    >
                      <img
                        src={f.pelicula?.poster}
                        alt=""
                        className="w-12 h-16 rounded-lg object-cover object-top shrink-0"
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-titulo font-bold text-gray-900 text-sm truncate">
                          {f.pelicula?.titulo}
                        </p>
                        <p className="text-xs text-gray-500 font-cuerpo mt-0.5">{f.pelicula?.genero}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500 font-cuerpo">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-primario" aria-hidden="true" />
                            {format(new Date(f.fechaHora), "h:mm a", { locale: es })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primario" aria-hidden="true" />
                            {f.sala?.nombre}
                          </span>
                          <span className="font-semibold text-primario">{formatearPrecio(f.precio)}</span>
                        </div>
                      </div>
                      <Button tamaño="sm" onClick={() => irAAsientos(f)} className="shrink-0">
                        Comprar
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
