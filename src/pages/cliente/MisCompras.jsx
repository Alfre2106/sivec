/**
 * MisCompras.jsx — Listado de compras del cliente autenticado.
 */

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Ticket, Calendar, ChevronRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { misCompras } from "@/services/comprasService"
import { obtenerFuncion } from "@/services/funcionesService"
import Spinner from "@/components/ui/Spinner"
import Badge from "@/components/ui/Badge"
import Poster from "@/components/Poster"
import { formatearFechaHora, formatearFechaMedia } from "@/utils/fechas"
import { formatearPrecio } from "@/utils/formato"

const VARIANTE_ESTADO = { confirmada: "exito", cancelada: "error", pendiente: "advertencia" }

export default function MisCompras() {
  const { usuario } = useAuth()
  const [items, setItems]   = useState([])  // [{ compra, funcion }]
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const compras = await misCompras(usuario.id)
        const enriquecidas = await Promise.all(
          compras.map(async (c) => {
            try { return { compra: c, funcion: await obtenerFuncion(c.funcionId) } }
            catch { return { compra: c, funcion: null } }
          })
        )
        setItems(enriquecidas.reverse())  // más reciente primero
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [usuario.id])

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Cargando tus compras..." /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-titulo text-2xl font-bold text-gray-900 mb-2">Mis Compras</h1>
      <p className="text-gray-500 font-cuerpo text-sm mb-8">Historial de todas tus entradas</p>

      {items.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center gap-4">
          <Ticket className="w-16 h-16 text-gray-300" aria-hidden="true" />
          <p className="text-gray-500 font-cuerpo">Aún no tienes compras registradas.</p>
          <Link to="/cartelera" className="btn-primario text-sm">Ver Cartelera</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map(({ compra, funcion }) => (
            <div key={compra.id} className="tarjeta overflow-hidden">
              {/* Cabecera */}
              <div className="bg-noche-oscuro px-4 py-3 flex items-center gap-3">
                {funcion?.pelicula && (
                  <Poster src={funcion.pelicula.poster} alt="" className="w-10 rounded object-cover object-top shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-titulo font-bold text-white text-sm truncate">
                    {funcion?.pelicula?.titulo ?? "Función no disponible"}
                  </p>
                  {funcion && (
                    <p className="text-gray-400 text-xs font-cuerpo flex items-center gap-1">
                      <Calendar className="w-3 h-3" aria-hidden="true" />
                      {formatearFechaHora(funcion.fechaHora)}
                      {" · "}{funcion.sala?.nombre}
                    </p>
                  )}
                </div>
                <Badge variante={VARIANTE_ESTADO[compra.estado] ?? "neutro"} className="shrink-0">
                  {compra.estado}
                </Badge>
              </div>

              {/* Entradas */}
              <div className="px-4 py-3 flex flex-col gap-2">
                {compra.entradas?.map((entrada) => (
                  <div key={entrada.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-cuerpo">
                      <span className="text-primario font-bold font-titulo">{entrada.asiento}</span>
                      <span className="text-gray-300 text-xs">|</span>
                      <span className="text-gray-500 text-xs font-mono">{entrada.codigo}</span>
                      <Badge variante={entrada.estado} className="text-[10px]">{entrada.estado}</Badge>
                    </div>
                    <Link
                      to={`/entrada/${entrada.id}`}
                      state={{ compra }}
                      className="text-primario hover:text-primario-oscuro transition-colors"
                      aria-label={`Ver QR de la entrada ${entrada.codigo}`}
                    >
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                ))}
              </div>

              {/* Pie */}
              <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400 font-cuerpo">
                  Comprado el {formatearFechaMedia(compra.fechaCompra)}
                </span>
                <span className="font-titulo font-bold text-primario text-sm">{formatearPrecio(compra.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
