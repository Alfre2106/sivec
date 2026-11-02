/**
 * HistorialVentas.jsx — Historial de todas las ventas (vista de taquillero).
 * Muestra todas las compras con su función, asientos, total y estado de entradas.
 */

import { useEffect, useState } from "react"
import { Search, Receipt, ChevronDown } from "lucide-react"
import { listarCompras }  from "@/services/comprasService"
import { obtenerFuncion } from "@/services/funcionesService"
import Spinner  from "@/components/ui/Spinner"
import Badge    from "@/components/ui/Badge"
import Input    from "@/components/ui/Input"
import { format } from "date-fns"
import { es }     from "date-fns/locale"
import { formatearPrecio } from "@/utils/formato"
import { cn } from "@/utils/cn"

const VARIANTE_ESTADO_ENTRADA = {
  activa:  "activa",
  usada:   "usada",
  anulada: "anulada",
}

export default function HistorialVentas() {
  const [registros, setRegistros] = useState([])  // [{ compra, funcion }]
  const [cargando,  setCargando]  = useState(true)
  const [busqueda,  setBusqueda]  = useState("")
  const [expandido, setExpandido] = useState(null) // id de la compra expandida

  useEffect(() => {
    const cargar = async () => {
      try {
        const compras = await listarCompras()
        const enriquecidas = await Promise.all(
          compras.map(async (c) => {
            try { return { compra: c, funcion: await obtenerFuncion(c.funcionId) } }
            catch { return { compra: c, funcion: null } }
          })
        )
        setRegistros(enriquecidas.reverse()) // más reciente primero
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const filtrados = registros.filter(({ compra, funcion }) => {
    const q = busqueda.toLowerCase()
    return (
      funcion?.pelicula?.titulo.toLowerCase().includes(q) ||
      compra.entradas?.some((e) => e.codigo.toLowerCase().includes(q)) ||
      (compra.clienteNombre ?? "").toLowerCase().includes(q)
    )
  })

  // Totales para el resumen superior
  const totalVentas  = registros.reduce((s, { compra }) => s + (compra.total ?? 0), 0)
  const totalEntradas = registros.reduce((s, { compra }) => s + (compra.entradas?.length ?? 0), 0)

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Cargando historial..." /></div>

  return (
    <div className="flex flex-col gap-6">

      {/* Encabezado */}
      <div>
        <h1 className="font-titulo text-2xl font-bold text-gray-900">Historial de Ventas</h1>
        <p className="text-gray-500 font-cuerpo text-sm mt-1">Registro de todas las transacciones</p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total recaudado",  valor: formatearPrecio(totalVentas),    color: "text-exito"   },
          { label: "Entradas vendidas", valor: totalEntradas.toString(),         color: "text-info"    },
          { label: "Transacciones",    valor: registros.length.toString(),       color: "text-primario"},
        ].map(({ label, valor, color }) => (
          <div key={label} className="tarjeta px-4 py-4 flex flex-col gap-1">
            <p className="text-xs text-gray-500 font-cuerpo uppercase tracking-wide">{label}</p>
            <p className={cn("font-titulo font-extrabold text-2xl", color)}>{valor}</p>
          </div>
        ))}
      </div>

      {/* Buscador */}
      <Input
        placeholder="Buscar por película, código o cliente..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        icono={<Search className="w-4 h-4" />}
      />

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <Receipt className="w-14 h-14 text-gray-200" aria-hidden="true" />
          <p className="text-gray-400 font-cuerpo">No se encontraron ventas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map(({ compra, funcion }) => {
            const abierto = expandido === compra.id
            return (
              <div key={compra.id} className="tarjeta overflow-hidden">

                {/* Fila principal */}
                <button
                  className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-fondo-panel transition-colors"
                  onClick={() => setExpandido(abierto ? null : compra.id)}
                  aria-expanded={abierto}
                  aria-controls={`detalle-${compra.id}`}
                >
                  {/* Póster miniatura */}
                  {funcion?.pelicula?.poster && (
                    <img
                      src={funcion.pelicula.poster}
                      alt=""
                      className="w-9 h-12 rounded object-cover object-top shrink-0"
                      aria-hidden="true"
                    />
                  )}

                  {/* Info principal */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-titulo font-bold text-gray-900 text-sm truncate">
                      {funcion?.pelicula?.titulo ?? "Función no disponible"}
                    </p>
                    <p className="text-xs text-gray-500 font-cuerpo mt-0.5">
                      {funcion
                        ? format(new Date(funcion.fechaHora), "d MMM yyyy · h:mm a", { locale: es })
                        : "—"}
                      {compra.clienteNombre && ` · ${compra.clienteNombre}`}
                    </p>
                  </div>

                  {/* Entradas + total */}
                  <div className="shrink-0 text-right flex flex-col gap-0.5">
                    <span className="font-titulo font-bold text-primario text-sm">
                      {formatearPrecio(compra.total)}
                    </span>
                    <span className="text-xs text-gray-400 font-cuerpo">
                      {compra.entradas?.length ?? 0} entrada{(compra.entradas?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Indicador expandir/contraer con texto claro */}
                  <span className="shrink-0 flex items-center gap-1 text-xs font-cuerpo font-semibold text-primario">
                    <span className="hidden sm:inline">{abierto ? "Ocultar" : "Ver detalle"}</span>
                    <ChevronDown
                      className={cn("w-4 h-4 transition-transform duration-200", abierto && "rotate-180")}
                      aria-hidden="true"
                    />
                  </span>
                </button>

                {/* Detalle expandible */}
                {abierto && (
                  <div
                    id={`detalle-${compra.id}`}
                    className="border-t border-gray-100 px-4 py-3 bg-fondo-panel animacion-entrada"
                  >
                    <div className="grid sm:grid-cols-2 gap-4 text-sm font-cuerpo">
                      {/* Columna izquierda */}
                      <div className="flex flex-col gap-2">
                        <Fila label="Sala">
                          {funcion?.sala?.nombre ?? "—"}
                        </Fila>
                        <Fila label="Fecha compra">
                          {format(new Date(compra.fechaCompra), "d MMM yyyy · h:mm a", { locale: es })}
                        </Fila>
                        <Fila label="Método pago">
                          <span className="capitalize">{compra.metodoPago ?? "tarjeta"}</span>
                        </Fila>
                        {compra.clienteDocumento && (
                          <Fila label="Documento">{compra.clienteDocumento}</Fila>
                        )}
                      </div>

                      {/* Columna derecha: entradas */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Entradas</p>
                        <div className="flex flex-col gap-1.5">
                          {compra.entradas?.map((e) => (
                            <div key={e.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-titulo font-bold text-primario text-xs">
                                  {e.asiento}
                                </span>
                                <span className="font-mono text-[10px] text-gray-400">{e.codigo}</span>
                              </div>
                              <Badge variante={VARIANTE_ESTADO_ENTRADA[e.estado] ?? "neutro"} className="text-[10px]">
                                {e.estado}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Fila de detalle ────────────────────────────────────────────────────────────
function Fila({ label, children }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-500 w-24 shrink-0 text-xs">{label}:</span>
      <span className="text-gray-800 font-medium text-xs">{children}</span>
    </div>
  )
}
