/**
 * reportesService.js — Reportes y métricas (solo administrador).
 *
 * Con usaApi("reportes") usa la API real (GET /reportes/*); si no, agrega datos simulados.
 * Mantiene las firmas que ya usaban Dashboard y Reportes, y añade las nuevas de la Fase I6
 * (reservas vencidas, intentos rechazados y exportación CSV autenticada).
 *
 * Todos los filtros de fecha son { desde, hasta } en formato "YYYY-MM-DD" (hora de Bogotá).
 */

import { usaApi } from "./config"
import { api } from "./apiClient"
import { simularLatencia } from "./config"
import { listarCompras } from "./mock/comprasMock"
import { listarTodasFunciones as mockFunciones } from "./mock/funcionesMock"
import { obtenerAsientos as mockAsientos } from "./mock/asientosMock"
import { listarUsuarios as mockUsuarios } from "./mock/usuariosMock"
import { subMonths, format } from "date-fns"
import { es } from "date-fns/locale"

const paramsFecha = ({ desde, hasta } = {}) => {
  const p = {}
  if (desde) p.desde = desde
  if (hasta) p.hasta = hasta
  return p
}

// ── Dashboard: métricas principales ───────────────────────────────────────────

/**
 * Métricas del dashboard. Mantiene el shape que leen las StatCards:
 *   { ventasTotales, entradasVendidas, funcionesActivas, usuariosRegistrados, totalTransacciones }
 */
export async function obtenerMetricasDashboard({ signal } = {}) {
  if (!usaApi("reportes")) return metricasMock()
  const r = await api.get("/reportes/resumen", { params: { dias: 30 }, signal })
  return {
    ventasTotales: r.ventas_totales ?? 0,
    entradasVendidas: r.entradas_vendidas ?? 0,
    funcionesActivas: r.funciones_activas ?? 0,
    usuariosRegistrados: r.usuarios_total ?? 0,
    ingresosAnulados: r.ingresos_anulados ?? 0,
    entradasAnuladas: r.entradas_anuladas ?? 0,
    ocupacionPromedio: r.ocupacion_promedio ?? 0,
  }
}

/**
 * Serie de ventas por mes para la gráfica. Shape: [{ mes, ventas }].
 */
export async function ventasPorMes({ signal } = {}) {
  if (!usaApi("reportes")) return ventasPorMesMock()
  const { serie } = await api.get("/reportes/ventas-por-mes", { params: { meses: 12 }, signal })
  // "2026-11" → "nov" para el eje X
  return (serie ?? []).map((s) => ({ mes: etiquetaMes(s.mes), ventas: s.ventas ?? 0, entradas: s.entradas ?? 0 }))
}

function etiquetaMes(clave) {
  // clave "AAAA-MM"; construimos una fecha local al día 1 para el nombre corto
  const [a, m] = String(clave).split("-").map(Number)
  if (!a || !m) return clave
  return format(new Date(a, m - 1, 1), "MMM", { locale: es })
}

/**
 * Ranking de películas más vendidas. Shape que usan Dashboard y Reportes:
 *   [{ titulo, entradas, porcentaje }]
 */
export async function funcionesMasVendidas({ signal, desde, hasta } = {}) {
  if (!usaApi("reportes")) return rankingMock()
  const r = await api.get("/reportes/peliculas-ranking", { params: { orden: "desc", limite: 10, ...paramsFecha({ desde, hasta }) }, signal })
  return (r.ranking ?? []).map((x) => ({
    titulo: x.pelicula,
    entradas: x.entradas_vendidas,
    porcentaje: Math.round(x.participacion ?? 0),
  }))
}

/**
 * Ocupación por función. Shape: [{ funcionId, pelicula, sala, fecha, ocupados, capacidad, porcentaje }].
 */
export async function reporteOcupacion({ signal, desde, hasta } = {}) {
  if (!usaApi("reportes")) return ocupacionMock()
  const { funciones } = await api.get("/reportes/ocupacion", { params: paramsFecha({ desde, hasta }), signal })
  return (funciones ?? []).map((f) => ({
    funcionId: f.funcion_id,
    pelicula: f.pelicula,
    sala: f.sala,
    fecha: f.inicio,
    ocupados: f.vendidos,
    capacidad: f.capacidad,
    porcentaje: Math.round(f.porcentaje ?? 0),
  }))
}

/**
 * Entradas por estado para el pie: { activas, usadas, anuladas, total }.
 * Se arma con el resumen (vendidas = activas+usadas, anuladas) y asistencia (usadas).
 */
export async function reporteEntradas({ signal } = {}) {
  if (!usaApi("reportes")) return entradasMock()
  const [resumen, asistencia] = await Promise.all([
    api.get("/reportes/resumen", { params: { dias: 730 }, signal }),
    api.get("/reportes/asistencia", { signal }),
  ])
  const vendidas = resumen.entradas_vendidas ?? 0
  const usadas = asistencia.global?.entradas_usadas ?? 0
  const activas = Math.max(0, vendidas - usadas)
  const anuladas = resumen.entradas_anuladas ?? 0
  return { activas, usadas, anuladas, total: activas + usadas + anuladas }
}

/**
 * Resumen de reservas del periodo: { total, expiradas, convertidas, canceladas, activas, tasaPerdida }.
 */
export async function reservasVencidas({ signal, desde, hasta } = {}) {
  if (!usaApi("reportes")) return { total: 0, expiradas: 0, convertidas: 0, canceladas: 0, activas: 0, tasaPerdida: 0 }
  const r = await api.get("/reportes/reservas-vencidas", { params: paramsFecha({ desde, hasta }), signal })
  return {
    total: r.total_reservas ?? 0,
    expiradas: r.expiradas ?? 0,
    convertidas: r.convertidas ?? 0,
    canceladas: r.canceladas ?? 0,
    activas: r.activas ?? 0,
    tasaPerdida: r.tasa_perdida ?? 0,
  }
}

/**
 * Intentos de validación rechazados: { total, porResultado, ultimos: [{id, fecha, codigo, resultado, taquillero, detalle}] }.
 */
export async function intentosRechazados({ signal, desde, hasta } = {}) {
  if (!usaApi("reportes")) return { total: 0, porResultado: {}, ultimos: [] }
  const r = await api.get("/reportes/intentos-rechazados", { params: paramsFecha({ desde, hasta }), signal })
  return {
    total: r.total_rechazados ?? 0,
    porResultado: r.por_resultado ?? {},
    ultimos: (r.ultimos ?? []).map((u) => ({
      id: u.id,
      fecha: u.fecha,
      codigo: u.codigo_leido,
      resultado: u.resultado,
      taquillero: u.taquillero,
      detalle: u.detalle,
    })),
  }
}

/**
 * Descarga un reporte en CSV usando fetch autenticado + blob.
 * @param {"ventas"|"ocupacion"|"ranking"|"validaciones"} tipo
 * @param {{desde?:string, hasta?:string}} [filtros]
 * @throws {ApiError} 422 TIPO_INVALIDO
 */
export async function exportarReporte(tipo, { desde, hasta } = {}) {
  const { blob, nombreArchivo } = await api.descargar("/reportes/exportar", {
    params: { tipo, ...paramsFecha({ desde, hasta }) },
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = nombreArchivo ?? `sivec_${tipo}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// ── Implementación simulada (cuando reportes no usa la API) ───────────────────

async function metricasMock() {
  await simularLatencia(500)
  const [compras, funciones, usuarios] = await Promise.all([listarCompras(), mockFunciones(), mockUsuarios()])
  return {
    ventasTotales: compras.reduce((s, c) => s + (c.total ?? 0), 0),
    entradasVendidas: compras.reduce((s, c) => s + (c.entradas?.length ?? 0), 0),
    funcionesActivas: funciones.filter((f) => f.estado === "activa").length,
    usuariosRegistrados: usuarios.length,
    totalTransacciones: compras.length,
  }
}

async function ventasPorMesMock() {
  await simularLatencia(400)
  const compras = await listarCompras()
  const base = Math.max(compras.reduce((s, c) => s + (c.total ?? 0), 0), 200000)
  const factores = [0.45, 0.52, 0.6, 0.68, 0.75, 0.82, 0.9, 0.95, 1]
  return factores.map((factor, i) => ({
    mes: format(subMonths(new Date(), 8 - i), "MMM", { locale: es }),
    ventas: Math.round(base * factor),
  }))
}

async function rankingMock() {
  await simularLatencia(400)
  const [compras, funciones] = await Promise.all([listarCompras(), mockFunciones()])
  const conteo = {}
  for (const compra of compras) {
    const funcion = funciones.find((f) => f.id === compra.funcionId)
    const titulo = funcion?.pelicula?.titulo ?? "Desconocida"
    conteo[titulo] = (conteo[titulo] ?? 0) + (compra.entradas?.length ?? 0)
  }
  const total = Object.values(conteo).reduce((s, n) => s + n, 0) || 1
  return Object.entries(conteo)
    .map(([titulo, entradas]) => ({ titulo, entradas, porcentaje: Math.round((entradas / total) * 100) }))
    .sort((a, b) => b.entradas - a.entradas)
}

async function ocupacionMock() {
  await simularLatencia(600)
  const funciones = await mockFunciones()
  const resultado = []
  for (const f of funciones.slice(0, 12)) {
    const asientos = await mockAsientos(f.id)
    const ocupados = asientos.filter((a) => a.estado !== "disponible").length
    const capacidad = asientos.length || 1
    resultado.push({
      funcionId: f.id, pelicula: f.pelicula?.titulo ?? "—", sala: f.sala?.nombre ?? "—",
      fecha: f.fechaHora, ocupados, capacidad, porcentaje: Math.round((ocupados / capacidad) * 100),
    })
  }
  return resultado
}

async function entradasMock() {
  await simularLatencia(400)
  const compras = await listarCompras()
  let activas = 0, usadas = 0, anuladas = 0
  for (const compra of compras) {
    for (const e of compra.entradas ?? []) {
      if (e.estado === "activa") activas++
      else if (e.estado === "usada") usadas++
      else if (e.estado === "anulada") anuladas++
    }
  }
  return { activas, usadas, anuladas, total: activas + usadas + anuladas }
}
