/**
 * Reportes.jsx — Panel completo de reportes del administrador.
 *
 * Secciones:
 *  1. Filtros globales (periodo + búsqueda de película)
 *  2. Resumen de ingresos totales del periodo
 *  3. Ingresos por película  ← NUEVO: responde "¿cuánto generó La Odisea?"
 *  4. Gráfica de barras: ingresos y entradas por película
 *  5. Detalle de ventas por función (filtrable y buscable)
 *  6. Estado de entradas (pie)
 *  7. Ocupación por función
 *  8. Reservas vencidas e intentos rechazados
 *  9. Exportaciones CSV autenticadas
 */

import { useCallback, useEffect, useRef, useState, useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts"
import {
  Download, Clock, ShieldAlert,
  Search, Filter, DollarSign, Ticket, Film,
} from "lucide-react"
import {
  funcionesMasVendidas, reporteOcupacion, reporteEntradas,
  reservasVencidas, intentosRechazados, exportarReporte,
  ventasPorFuncion,
} from "@/services/reportesService"
import { useToast } from "@/components/ui/Toast"
import { fueCancelada, mensajeDeError } from "@/services/apiClient"
import Button  from "@/components/ui/Button"
import Input   from "@/components/ui/Input"
import Spinner from "@/components/ui/Spinner"
import MensajeError from "@/components/ui/MensajeError"
import { formatearFechaCortaHora, formatearDiaHora } from "@/utils/fechas"
import { formatearPrecio } from "@/utils/formato"
import { cn } from "@/utils/cn"

const COLORES_PIE = { activas: "#3B82F6", usadas: "#7C3AED", anuladas: "#EF4444" }
const COLORES_BAR = ["#7C3AED","#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899"]
const ETIQUETA_RECHAZO = { invalida: "Inválida", ya_usada: "Ya usada", otra_funcion: "Otra función", anulada: "Anulada" }

// Rangos rápidos de fecha
const hoy = () => { const h = new Date(); return h.toISOString().slice(0,10) }
const diasAtras = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10) }
const RANGOS = [
  { label: "Todo",          desde: "",             hasta: "" },
  { label: "Esta semana",   desde: diasAtras(7),   hasta: hoy() },
  { label: "Último mes",    desde: diasAtras(30),  hasta: hoy() },
  { label: "Últimos 3 m",   desde: diasAtras(90),  hasta: hoy() },
]

export default function Reportes() {
  const { toast } = useToast()

  // ── Filtros ───────────────────────────────────────────────────────────────
  const [desde,    setDesde]    = useState("")
  const [hasta,    setHasta]    = useState("")
  const [busqueda, setBusqueda] = useState("")

  // ── Datos ─────────────────────────────────────────────────────────────────
  const [ventas,    setVentas]    = useState([])  // ventas-por-funcion
  const [ranking,   setRanking]   = useState([])  // ranking de entradas
  const [ocupacion, setOcupacion] = useState([])
  const [entradas,  setEntradas]  = useState(null)
  const [reservas,  setReservas]  = useState(null)
  const [rechazos,  setRechazos]  = useState(null)
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)
  const [exportando, setExportando] = useState(null)
  const ctrl = useRef(null)

  const cargar = useCallback((d = desde, h = hasta) => {
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    setCargando(true)
    setError(null)
    const opts = { signal: c.signal, desde: d || undefined, hasta: h || undefined }
    Promise.all([
      ventasPorFuncion(opts),
      funcionesMasVendidas(opts),
      reporteOcupacion(opts),
      reporteEntradas({ signal: c.signal }),
      reservasVencidas(opts),
      intentosRechazados(opts),
    ])
      .then(([v, r, o, e, rv, ir]) => {
        if (c.signal.aborted) return
        setVentas(v); setRanking(r); setOcupacion(o)
        setEntradas(e); setReservas(rv); setRechazos(ir)
      })
      .catch((err) => { if (!fueCancelada(err)) setError(mensajeDeError(err, "No pudimos generar los reportes.")) })
      .finally(() => { if (!c.signal.aborted) setCargando(false) })
  }, [desde, hasta])

  useEffect(() => {
    cargar()
    return () => ctrl.current?.abort()
  }, [cargar])

  const aplicarRango = (d, h) => { setDesde(d); setHasta(h) }

  // ── Ingresos agrupados por película ──────────────────────────────────────
  const porPelicula = useMemo(() => {
    const mapa = {}
    for (const f of ventas) {
      if (!mapa[f.pelicula]) mapa[f.pelicula] = { pelicula: f.pelicula, funciones: 0, entradas: 0, ingresos: 0 }
      mapa[f.pelicula].funciones++
      mapa[f.pelicula].entradas += f.entradasVendidas
      mapa[f.pelicula].ingresos += f.ingresos
    }
    return Object.values(mapa).sort((a, b) => b.ingresos - a.ingresos)
  }, [ventas])

  const totalIngresos = useMemo(() => porPelicula.reduce((s, p) => s + p.ingresos, 0), [porPelicula])
  const totalEntradas = useMemo(() => porPelicula.reduce((s, p) => s + p.entradas, 0), [porPelicula])
  const maxIngresos = porPelicula[0]?.ingresos || 1

  // Ventas por función filtradas por búsqueda
  const ventasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return ventas.filter((f) => f.ingresos > 0 || f.entradasVendidas > 0)
    const q = busqueda.toLowerCase()
    return ventas.filter((f) =>
      f.pelicula.toLowerCase().includes(q) || f.sala.toLowerCase().includes(q)
    )
  }, [ventas, busqueda])

  // Películas filtradas por búsqueda para la tabla de ingresos
  const peliculasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return porPelicula
    const q = busqueda.toLowerCase()
    return porPelicula.filter((p) => p.pelicula.toLowerCase().includes(q))
  }, [porPelicula, busqueda])

  const datosPie = entradas
    ? [
        { name: "Activas",  value: entradas.activas,  key: "activas"  },
        { name: "Usadas",   value: entradas.usadas,   key: "usadas"   },
        { name: "Anuladas", value: entradas.anuladas, key: "anuladas" },
      ].filter((d) => d.value > 0)
    : []

  const exportar = async (tipo) => {
    setExportando(tipo)
    try {
      await exportarReporte(tipo, { desde: desde || undefined, hasta: hasta || undefined })
      toast({ tipo: "exito", titulo: "Descarga iniciada", mensaje: `CSV de ${tipo}.` })
    } catch (err) {
      toast({ tipo: "error", titulo: "No se pudo exportar", mensaje: mensajeDeError(err, err.message) })
    } finally {
      setExportando(null)
    }
  }

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Generando reportes..." /></div>
  if (error) return <MensajeError mensaje={error} onReintentar={() => cargar()} />

  return (
    <div className="flex flex-col gap-6">

      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-titulo text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 font-cuerpo text-sm mt-1">Estadísticas y exportación de datos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["ventas","ranking","validaciones"].map((t) => (
            <Button key={t} variante="secundario" tamaño="sm" onClick={() => exportar(t)} cargando={exportando === t}>
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="capitalize">{t}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* ── Filtros globales ─────────────────────────────────────────────── */}
      <div className="tarjeta p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-cuerpo font-semibold text-gray-600">
          <Filter className="w-4 h-4" aria-hidden="true" />
          Filtros
        </div>
        {/* Rangos rápidos */}
        <div className="flex flex-wrap gap-2">
          {RANGOS.map((r) => (
            <button
              key={r.label}
              onClick={() => aplicarRango(r.desde, r.hasta)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-cuerpo font-semibold transition-colors",
                desde === r.desde && hasta === r.hasta
                  ? "bg-primario text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-primario-suave hover:text-primario"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        {/* Datepickers + búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Input
              tipo="date"
              etiqueta="Desde"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="text-sm"
            />
            <Input
              tipo="date"
              etiqueta="Hasta"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex-1">
            <Input
              etiqueta="Buscar película"
              placeholder="Ej: La Odisea"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              icono={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
        {(desde || hasta) && (
          <p className="text-xs text-gray-400 font-cuerpo">
            Mostrando {desde && `desde ${desde}`}{desde && hasta && " · "}{hasta && `hasta ${hasta}`}.{" "}
            <button className="text-primario hover:underline" onClick={() => aplicarRango("","")}>Limpiar</button>
          </p>
        )}
      </div>

      {/* ── Resumen del periodo ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icono: <DollarSign />, color: "bg-green-100 text-exito", label: "Total recaudado", valor: formatearPrecio(totalIngresos) },
          { icono: <Ticket />,     color: "bg-blue-100 text-info",   label: "Entradas vendidas", valor: totalEntradas.toLocaleString("es-CO") },
          { icono: <Film />,       color: "bg-primario-suave text-primario", label: "Películas con ventas", valor: porPelicula.filter((p) => p.ingresos > 0).length },
        ].map(({ icono, color, label, valor }) => (
          <div key={label} className="tarjeta p-4 flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5", color)} aria-hidden="true">{icono}</div>
            <div>
              <p className="text-xs text-gray-500 font-cuerpo uppercase tracking-wide">{label}</p>
              <p className="font-titulo font-extrabold text-xl text-gray-900">{valor}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Ingresos por película ────────────────────────────────────────── */}
      <div className="tarjeta overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-titulo font-bold text-gray-900">Ingresos por Película</h2>
          <span className="text-xs text-gray-400 font-cuerpo">
            {peliculasFiltradas.length} película{peliculasFiltradas.length !== 1 ? "s" : ""}
            {busqueda ? " · búsqueda activa" : ""}
          </span>
        </div>
        {peliculasFiltradas.length === 0 ? (
          <p className="text-gray-400 text-sm font-cuerpo py-10 text-center">
            {busqueda ? `No hay resultados para "${busqueda}".` : "Sin ventas en este periodo."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-cuerpo">
              <thead className="bg-fondo-panel border-b border-gray-200">
                <tr>
                  {["#", "Película", "Funciones", "Entradas", "Ingresos", "% del total", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-gray-600 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {peliculasFiltradas.map((p, i) => {
                  const pct = totalIngresos > 0 ? Math.round((p.ingresos / totalIngresos) * 100) : 0
                  const barPct = maxIngresos > 0 ? Math.round((p.ingresos / maxIngresos) * 100) : 0
                  return (
                    <tr key={p.pelicula} className="border-b border-gray-50 hover:bg-fondo-panel/50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs font-titulo font-bold">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-titulo font-bold text-gray-900">{p.pelicula}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-center">{p.funciones}</td>
                      <td className="px-4 py-3 text-gray-700 font-semibold text-center">{p.entradas}</td>
                      <td className="px-4 py-3 font-titulo font-extrabold text-primario whitespace-nowrap">
                        {formatearPrecio(p.ingresos)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-center">{pct}%</td>
                      <td className="px-4 py-3 w-32">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-degradado-violeta transition-all duration-500"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-fondo-panel border-t-2 border-gray-200">
                <tr>
                  <td colSpan={3} className="px-4 py-3 font-titulo font-bold text-gray-700">Total</td>
                  <td className="px-4 py-3 font-titulo font-bold text-gray-900 text-center">{totalEntradas}</td>
                  <td className="px-4 py-3 font-titulo font-extrabold text-primario whitespace-nowrap">
                    {formatearPrecio(totalIngresos)}
                  </td>
                  <td className="px-4 py-3 font-titulo font-bold text-gray-700 text-center">100%</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Gráfica: ingresos por película ───────────────────────────────── */}
      {porPelicula.filter((p) => p.ingresos > 0).length > 0 && (
        <div className="tarjeta p-5">
          <h2 className="font-titulo font-bold text-gray-900 mb-4">Gráfica de Ingresos por Película</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={porPelicula.filter((p) => p.ingresos > 0)}
              margin={{ top: 10, right: 10, left: 10, bottom: 50 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                dataKey="pelicula" type="category"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false} tickLine={false} width={130}
              />
              <Tooltip
                formatter={(v) => [formatearPrecio(v), "Ingresos"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 13 }}
              />
              <Bar dataKey="ingresos" radius={[0, 6, 6, 0]}>
                {porPelicula.filter((p) => p.ingresos > 0).map((_, i) => (
                  <Cell key={i} fill={COLORES_BAR[i % COLORES_BAR.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Detalle de ventas por función ────────────────────────────────── */}
      <div className="tarjeta overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-titulo font-bold text-gray-900">
            Detalle por Función
            {busqueda && <span className="ml-2 text-xs font-cuerpo text-gray-400">· "{busqueda}"</span>}
          </h2>
          <span className="text-xs text-gray-400 font-cuerpo">{ventasFiltradas.length} función{ventasFiltradas.length !== 1 ? "es" : ""}</span>
        </div>
        {ventasFiltradas.length === 0 ? (
          <p className="text-gray-400 text-sm font-cuerpo py-10 text-center">Sin funciones con ventas en este periodo.</p>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm font-cuerpo">
              <thead className="bg-fondo-panel border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  {["Película", "Sala", "Fecha y hora", "Entradas", "Ingresos"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-gray-600 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.map((f) => (
                  <tr key={f.funcionId} className="border-b border-gray-50 hover:bg-fondo-panel/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{f.pelicula}</td>
                    <td className="px-4 py-3 text-gray-500">{f.sala}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatearDiaHora(f.inicio)}</td>
                    <td className="px-4 py-3 text-gray-700 font-semibold text-center">{f.entradasVendidas}</td>
                    <td className="px-4 py-3 font-titulo font-bold text-primario whitespace-nowrap">
                      {formatearPrecio(f.ingresos)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Gráficas de entradas y ranking ───────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="tarjeta p-5">
          <h2 className="font-titulo font-bold text-gray-900 mb-4">Películas Más Vendidas (entradas)</h2>
          {ranking.length === 0 ? (
            <p className="text-gray-400 text-sm font-cuerpo py-10 text-center">Sin ventas registradas.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ranking.map((r) => ({ nombre: r.titulo, entradas: r.entradas }))} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 13 }} formatter={(v) => [`${v} entradas`, "Vendidas"]} />
                <Bar dataKey="entradas" radius={[6, 6, 0, 0]}>
                  {ranking.map((_, i) => <Cell key={i} fill="#7C3AED" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

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

      {/* ── Reservas vencidas + Intentos rechazados ──────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
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

      {/* ── Ocupación por función ────────────────────────────────────────── */}
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
                {ocupacion
                  .filter((o) => !busqueda || o.pelicula.toLowerCase().includes(busqueda.toLowerCase()))
                  .map((o) => (
                  <tr key={o.funcionId} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{o.pelicula}</td>
                    <td className="px-4 py-3 text-gray-600">{o.sala}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatearFechaCortaHora(o.fecha)}</td>
                    <td className="px-4 py-3 text-gray-600">{o.ocupados} / {o.capacidad}</td>
                    <td className="px-4 py-3 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", o.porcentaje >= 80 ? "bg-error" : o.porcentaje >= 50 ? "bg-advertencia" : "bg-exito")}
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
