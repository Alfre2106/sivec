/**
 * Dashboard.jsx — Panel principal del administrador.
 * Métricas (StatCards) + gráfica de ventas por mes + ranking de funciones más vendidas.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts"
import { DollarSign, Ticket, Film, Users, RotateCcw } from "lucide-react"
import {
  obtenerMetricasDashboard, ventasPorMes, funcionesMasVendidas,
} from "@/services/reportesService"
import { usaApi } from "@/services/config"
import { fueCancelada, mensajeDeError } from "@/services/apiClient"
import { reiniciarTodo } from "@/services/almacenamiento"
import StatCard from "@/components/StatCard"
import Spinner  from "@/components/ui/Spinner"
import Button   from "@/components/ui/Button"
import Modal    from "@/components/ui/Modal"
import MensajeError from "@/components/ui/MensajeError"
import { formatearPrecio } from "@/utils/formato"

const DATOS_REALES = usaApi("reportes")

export default function Dashboard() {
  const [metricas,  setMetricas]  = useState(null)
  const [serieMes,  setSerieMes]  = useState([])
  const [ranking,   setRanking]   = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)
  const [confirmarReinicio, setConfirmarReinicio] = useState(false)

  const ctrlRef = useRef(null)

  const cargar = useCallback(() => {
    ctrlRef.current?.abort()
    const ctrl = new AbortController()
    ctrlRef.current = ctrl
    setCargando(true)
    setError(null)
    Promise.all([
      obtenerMetricasDashboard({ signal: ctrl.signal }),
      ventasPorMes({ signal: ctrl.signal }),
      funcionesMasVendidas({ signal: ctrl.signal }),
    ])
      .then(([m, s, r]) => { if (!ctrl.signal.aborted) { setMetricas(m); setSerieMes(s); setRanking(r) } })
      .catch((e) => { if (!fueCancelada(e) && !ctrl.signal.aborted) setError(mensajeDeError(e, "No pudimos cargar el panel.")) })
      .finally(() => { if (!ctrl.signal.aborted) setCargando(false) })
  }, [])

  useEffect(() => {
    cargar()
    return () => ctrlRef.current?.abort()
  }, [cargar])

  // Reinicia los datos mock de fábrica (borra localStorage y recarga)
  const reiniciarDatos = () => {
    reiniciarTodo()
    window.location.reload()
  }

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Cargando dashboard..." /></div>
  if (error) return <MensajeError mensaje={error} onReintentar={cargar} />

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-titulo text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-500 font-cuerpo text-sm mt-1">Resumen general del sistema</p>
        </div>
        {/* El reinicio solo tiene sentido con datos simulados */}
        {!DATOS_REALES && (
          <Button variante="fantasma" tamaño="sm" onClick={() => setConfirmarReinicio(true)}>
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Reiniciar datos de prueba
          </Button>
        )}
      </div>

      {/* ── StatCards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icono={<DollarSign />} colorIcono="bg-metrica-ventas"
          etiqueta="Ventas Totales" valor={formatearPrecio(metricas.ventasTotales)} />
        <StatCard icono={<Ticket />} colorIcono="bg-metrica-entradas"
          etiqueta="Entradas Vendidas" valor={metricas.entradasVendidas.toLocaleString("es-CO")} />
        <StatCard icono={<Film />} colorIcono="bg-metrica-activas"
          etiqueta="Funciones Activas" valor={metricas.funcionesActivas} />
        <StatCard icono={<Users />} colorIcono="bg-primario"
          etiqueta="Usuarios Registrados" valor={metricas.usuariosRegistrados} />
      </div>

      {/* ── Gráficas ────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Ventas por mes */}
        <div className="tarjeta p-5">
          <h2 className="font-titulo font-bold text-gray-900 mb-4">Ventas por Mes</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={serieMes} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#7C3AED" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v) => [formatearPrecio(v), "Ventas"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 13 }}
              />
              <Area type="monotone" dataKey="ventas" stroke="#7C3AED" strokeWidth={2.5} fill="url(#gradVentas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Funciones más vendidas */}
        <div className="tarjeta p-5">
          <h2 className="font-titulo font-bold text-gray-900 mb-4">Funciones Más Vendidas</h2>
          {ranking.length === 0 ? (
            <p className="text-gray-400 text-sm font-cuerpo py-10 text-center">Sin datos de ventas aún.</p>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              {ranking.map((item, i) => (
                <div key={item.titulo} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-cuerpo text-gray-700 flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-primario-suave text-primario text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate max-w-[180px]">{item.titulo}</span>
                    </span>
                    <span className="font-titulo font-bold text-gray-900 text-xs shrink-0">
                      {item.porcentaje}%
                    </span>
                  </div>
                  {/* Barra de progreso */}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-degradado-violeta rounded-full transition-all duration-500"
                      style={{ width: `${item.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de reinicio */}
      <Modal
        abierto={confirmarReinicio}
        onCerrar={() => setConfirmarReinicio(false)}
        titulo="Reiniciar datos de prueba"
        tamaño="sm"
      >
        <p className="text-sm text-gray-600 font-cuerpo mb-5">
          Esto borrará todos los cambios (funciones, salas, usuarios, ventas) y
          restaurará los datos mock originales. Útil antes de una demostración.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variante="fantasma" onClick={() => setConfirmarReinicio(false)}>Cancelar</Button>
          <Button variante="peligro" onClick={reiniciarDatos}>Reiniciar</Button>
        </div>
      </Modal>
    </div>
  )
}
