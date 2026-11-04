/**
 * Reportes.jsx — Reportes del administrador con exportación a CSV.
 *
 * Reportes incluidos:
 *  - Ventas por función (barras) y estado de entradas (pie)
 *  - Ocupación por función
 *  - Películas más y menos vendidas
 *  - Reservas vencidas (tasa de pérdida)
 *  - Intentos de validación rechazados
 *  - Exportación a CSV (ventas, ocupación, ranking, validaciones) vía descarga autenticada
 */

import { useCallback, useEffect, useRef, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts"
import { Download, TrendingUp, TrendingDown, Clock, ShieldAlert } from "lucide-react"
import {
  funcionesMasVendidas, reporteOcupacion, reporteEntradas,
  reservasVencidas, intentosRechazados, exportarReporte,
} from "@/services/reportesService"
import { useToast } from "@/components/ui/Toast"
import { fueCancelada, mensajeDeError } from "@/services/apiClient"
import Button  from "@/components/ui/Button"
import Spinner from "@/components/ui/Spinner"
import MensajeError from "@/components/ui/MensajeError"
import { formatearFechaCortaHora } from "@/utils/fechas"
import { cn } from "@/utils/cn"

const COLORES_PIE = { activas: "#3B82F6", usadas: "#7C3AED", anuladas: "#EF4444" }
const ETIQUETA_RECHAZO = { invalida: "Inválida", ya_usada: "Ya usada", otra_funcion: "Otra función", anulada: "Anulada" }

export default function Reportes() {
  const { toast } = useToast()
  const [ranking,   setRanking]   = useState([])
  const [ocupacion, setOcupacion] = useState([])
  const [entradas,  setEntradas]  = useState(null)
  const [reservas,  setReservas]  = useState(null)
  const [rechazos,  setRechazos]  = useState(null)
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)
  const [exportando, setExportando] = useState(null) // tipo en curso
  const ctrl = useRef(null)

  const cargar = useCallback(() => {
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    setCargando(true)
    setError(null)
    Promise.all([
      funcionesMasVendidas({ signal: c.signal }),
      reporteOcupacion({ signal: c.signal }),
      reporteEntradas({ signal: c.signal }),
      reservasVencidas({ signal: c.signal }),
      intentosRechazados({ signal: c.signal }),
    ])
      .then(([r, o, e, rv, ir]) => {
        if (c.signal.aborted) return
        setRanking(r); setOcupacion(o); setEntradas(e); setReservas(rv); setRechazos(ir)
      })
      .catch((err) => { if (!fueCancelada(err)) setError(mensajeDeError(err, "No pudimos generar los reportes.")) })
      .finally(() => { if (!c.signal.aborted) setCargando(false) })
  }, [])

  useEffect(() => {
    cargar()
    return () => ctrl.current?.abort()
  }, [cargar])

  const exportar = async (tipo) => {
    setExportando(tipo)
    try {
      await exportarReporte(tipo)
      toast({ tipo: "exito", titulo: "Descarga iniciada", mensaje: `CSV de ${tipo}.` })
    } catch (err) {
      toast({ tipo: "error", titulo: "No se pudo exportar", mensaje: mensajeDeError(err, err.message) })
    } finally {
      setExportando(null)
    }
  }

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Generando reportes..." /></div>
  if (error) return <MensajeError mensaje={error} onReintentar={cargar} />

  const datosBarras = ranking.map((r) => ({ nombre: r.titulo, entradas: r.entradas }))
  const datosPie = entradas
    ? [
        { name: "Activas",  value: entradas.activas,  key: "activas"  },
        { name: "Usadas",   value: entradas.usadas,   key: "usadas"   },
        { name: "Anuladas", value: entradas.anuladas, key: "anuladas" },
      ].filter((d) => d.value > 0)
    : []
  const masVendida   = ranking[0]
  const menosVendida = ranking[ranking.length - 1]

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-titulo text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 font-cuerpo text-sm mt-1">Estadísticas y exportación de datos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variante="secundario" tamaño="sm" onClick={() => exportar("ventas")} cargando={exportando === "ventas"}>
            <Download className="w-3.5 h-3.5" aria-hidden="true" /> Ventas
          </Button>
          <Button variante="secundario" tamaño="sm" onClick={() => exportar("ranking")} cargando={exportando === "ranking"}>
            <Download className="w-3.5 h-3.5" aria-hidden="true" /> Ranking
          </Button>
          <Button variante="secundario" tamaño="sm" onClick={() => exportar("validaciones")} cargando={exportando === "validaciones"}>
            <Download className="w-3.5 h-3.5" aria-hidden="true" /> Validaciones
          </Button>
        </div>
      </div>

      {/* Resumen más/menos vendida */}
      {masVendida && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="tarjeta p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-exito" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-cuerpo uppercase tracking-wide">Más vendida</p>
              <p className="font-titulo font-bold text-gray-900">{masVendida.titulo}</p>
              <p className="text-xs text-gray-500 font-cuerpo">{masVendida.entradas} entradas</p>
            </div>
          </div>
          {menosVendida && menosVendida !== masVendida && (
            <div className="tarjeta p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-error" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-cuerpo uppercase tracking-wide">Menos vendida</p>
                <p className="font-titulo font-bold text-gray-900">{menosVendida.titulo}</p>
                <p className="text-xs text-gray-500 font-cuerpo">{menosVendida.entradas} entradas</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ventas por función (barras) */}
        <div className="tarjeta p-5">
          <h2 className="font-titulo font-bold text-gray-900 mb-4">Películas Más Vendidas</h2>
          {datosBarras.length === 0 ? (
            <p className="text-gray-400 text-sm font-cuerpo py-10 text-center">Sin ventas registradas.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={datosBarras} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 13 }} formatter={(v) => [`${v} entradas`, "Vendidas"]} />
                <Bar dataKey="entradas" radius={[6, 6, 0, 0]}>
                  {datosBarras.map((_, i) => <Cell key={i} fill="#7C3AED" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Entradas: usadas vs vendidas vs anuladas (pie) */}
        <div className="tarjeta p-5">
          <h2 className="font-titulo font-bold text-gray-900 mb-4">Estado de Entradas</h2>
          {datosPie.length === 0 ? (
            <p className="text-gray-400 text-sm font-cuerpo py-10 text-center">Sin entradas registradas.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={datosPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {datosPie.map((d) => <Cell key={d.key} fill={COLORES_PIE[d.key]} />)}
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 13, fontFamily: "Inter" }} />
                <Tooltip formatter={(v, n) => [`${v} entradas`, n]} contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Reservas vencidas + Intentos rechazados */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reservas vencidas */}
        <div className="tarjeta p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primario" aria-hidden="true" />
            <h2 className="font-titulo font-bold text-gray-900">Reservas Vencidas</h2>
          </div>
          {reservas && (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-cuerpo uppercase tracking-wide">Tasa de pérdida</p>
                  <p className="font-titulo font-extrabold text-3xl text-gray-900">{reservas.tasaPerdida}%</p>
                </div>
                <p className="text-xs text-gray-500 font-cuerpo">{reservas.total} reservas en total</p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { l: "Expiradas",   v: reservas.expiradas,   c: "text-error" },
                  { l: "Convertidas", v: reservas.convertidas, c: "text-exito" },
                  { l: "Canceladas",  v: reservas.canceladas,  c: "text-gray-600" },
                  { l: "Activas",     v: reservas.activas,     c: "text-info" },
                ].map((x) => (
                  <div key={x.l} className="bg-fondo-panel rounded-lg py-2">
                    <p className={cn("font-titulo font-bold text-lg", x.c)}>{x.v}</p>
                    <p className="text-[10px] text-gray-500 font-cuerpo uppercase tracking-wide">{x.l}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Intentos rechazados */}
        <div className="tarjeta p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-error" aria-hidden="true" />
            <h2 className="font-titulo font-bold text-gray-900">Intentos Rechazados</h2>
          </div>
          {rechazos && (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-titulo font-extrabold text-3xl text-gray-900">{rechazos.total}</span>
                <span className="text-xs text-gray-500 font-cuerpo">intentos rechazados</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(rechazos.porResultado).map(([k, v]) => (
                  <span key={k} className="text-xs font-cuerpo bg-fondo-panel rounded-full px-3 py-1 text-gray-600">
                    {ETIQUETA_RECHAZO[k] ?? k}: <strong className="text-gray-900">{v}</strong>
                  </span>
                ))}
              </div>
              {rechazos.ultimos.length > 0 && (
                <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {rechazos.ultimos.slice(0, 10).map((u) => (
                    <div key={u.id} className="flex items-center justify-between gap-2 text-xs font-cuerpo border-b border-gray-50 pb-1">
                      <span className="font-mono text-gray-500 truncate">{u.codigo}</span>
                      <span className="text-gray-400 shrink-0">{ETIQUETA_RECHAZO[u.resultado] ?? u.resultado}</span>
                      <span className="text-gray-400 shrink-0">{formatearFechaCortaHora(u.fecha)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ocupación por función */}
      <div className="tarjeta overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-titulo font-bold text-gray-900">Ocupación por Función</h2>
          <Button variante="secundario" tamaño="sm" onClick={() => exportar("ocupacion")} cargando={exportando === "ocupacion"}>
            <Download className="w-3.5 h-3.5" aria-hidden="true" /> Exportar
          </Button>
        </div>
        {ocupacion.length === 0 ? (
          <p className="text-gray-400 text-sm font-cuerpo py-10 text-center">Sin funciones para mostrar.</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-cuerpo">
            <thead className="bg-fondo-panel border-b border-gray-200">
              <tr>
                {["Película", "Sala", "Fecha", "Ocupación", "%"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-600 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ocupacion.map((o) => (
                <tr key={o.funcionId} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{o.pelicula}</td>
                  <td className="px-4 py-3 text-gray-600">{o.sala}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatearFechaCortaHora(o.fecha)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.ocupados} / {o.capacidad}</td>
                  <td className="px-4 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            o.porcentaje >= 80 ? "bg-error" : o.porcentaje >= 50 ? "bg-advertencia" : "bg-exito"
                          )}
                          style={{ width: `${o.porcentaje}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-9 text-right">{o.porcentaje}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}
