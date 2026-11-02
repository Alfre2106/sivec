/**
 * Reportes.jsx — Reportes del administrador con exportación a CSV.
 *
 * Reportes incluidos:
 *  - Ventas por función (gráfica de barras)
 *  - Ocupación por función
 *  - Entradas usadas vs vendidas vs anuladas
 *  - Funciones más y menos vendidas
 */

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts"
import { Download, TrendingUp, TrendingDown } from "lucide-react"
import {
  funcionesMasVendidas, reporteOcupacion, reporteEntradas, exportarCSV,
} from "@/services/reportesService"
import Button  from "@/components/ui/Button"
import Spinner from "@/components/ui/Spinner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/utils/cn"

const COLORES_PIE = { activas: "#3B82F6", usadas: "#7C3AED", anuladas: "#EF4444" }

export default function Reportes() {
  const [ranking,   setRanking]   = useState([])
  const [ocupacion, setOcupacion] = useState([])
  const [entradas,  setEntradas]  = useState(null)
  const [cargando,  setCargando]  = useState(true)

  useEffect(() => {
    Promise.all([funcionesMasVendidas(), reporteOcupacion(), reporteEntradas()])
      .then(([r, o, e]) => { setRanking(r); setOcupacion(o); setEntradas(e) })
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Generando reportes..." /></div>

  // Datos para la gráfica de barras (ventas por función)
  const datosBarras = ranking.map((r) => ({ nombre: r.titulo, entradas: r.entradas }))

  // Datos para el pie de entradas
  const datosPie = entradas
    ? [
        { name: "Activas",  value: entradas.activas,  key: "activas"  },
        { name: "Usadas",   value: entradas.usadas,   key: "usadas"   },
        { name: "Anuladas", value: entradas.anuladas, key: "anuladas" },
      ].filter((d) => d.value > 0)
    : []

  const masVendida   = ranking[0]
  const menosVendida = ranking[ranking.length - 1]

  // Exportaciones
  const exportarOcupacion = () => {
    exportarCSV(
      ocupacion.map((o) => ({
        Pelicula: o.pelicula,
        Sala: o.sala,
        Fecha: format(new Date(o.fecha), "yyyy-MM-dd HH:mm"),
        Ocupados: o.ocupados,
        Capacidad: o.capacidad,
        "Ocupacion %": o.porcentaje,
      })),
      "reporte-ocupacion.csv"
    )
  }

  const exportarVentas = () => {
    exportarCSV(
      ranking.map((r) => ({ Pelicula: r.titulo, "Entradas vendidas": r.entradas, "Porcentaje %": r.porcentaje })),
      "reporte-ventas.csv"
    )
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-titulo text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 font-cuerpo text-sm mt-1">Estadísticas y exportación de datos</p>
        </div>
        <Button variante="secundario" onClick={exportarVentas}>
          <Download className="w-4 h-4" aria-hidden="true" /> Exportar Ventas
        </Button>
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
          <h2 className="font-titulo font-bold text-gray-900 mb-4">Ventas por Función</h2>
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

      {/* Ocupación por función */}
      <div className="tarjeta overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-titulo font-bold text-gray-900">Ocupación por Función</h2>
          <Button variante="secundario" tamaño="sm" onClick={exportarOcupacion}>
            <Download className="w-3.5 h-3.5" aria-hidden="true" /> Exportar
          </Button>
        </div>
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
                    {format(new Date(o.fecha), "d MMM · h:mm a", { locale: es })}
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
      </div>
    </div>
  )
}
