/**
 * reportesService.js — Servicio de reportes y métricas agregadas.
 *
 * Calcula estadísticas a partir de compras, funciones, asientos y entradas.
 * HOY: agrega datos mock en memoria.
 * DESPUÉS: GET /api/reportes/* (el backend hará los agregados en SQL).
 */

import { simularLatencia } from "./config"
// Reportes siguen simulados hasta la Fase I6: todo sale de los mocks
import { listarCompras } from "./mock/comprasMock"
import { listarTodasFunciones } from "./funcionesAdminService"
import { obtenerAsientos } from "./mock/asientosMock"
import { listarUsuarios } from "./usuariosService"
import { subMonths, format } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Métricas principales del dashboard.
 * @returns {Promise<Object>}
 */
export async function obtenerMetricasDashboard() {
  await simularLatencia(500)

  const [compras, funciones, usuarios] = await Promise.all([
    listarCompras(),
    listarTodasFunciones(),
    listarUsuarios(),
  ])

  const ventasTotales   = compras.reduce((s, c) => s + (c.total ?? 0), 0)
  const entradasVendidas = compras.reduce((s, c) => s + (c.entradas?.length ?? 0), 0)
  const funcionesActivas = funciones.filter((f) => f.estado === "activa").length

  return {
    ventasTotales,
    entradasVendidas,
    funcionesActivas,
    usuariosRegistrados: usuarios.length,
    totalTransacciones: compras.length,
  }
}

/**
 * Ventas agrupadas por mes (últimos 9 meses) para el gráfico de líneas.
 * Como los datos mock son pocos, generamos una serie realista basada en el total.
 * @returns {Promise<{mes: string, ventas: number}[]>}
 */
export async function ventasPorMes() {
  await simularLatencia(400)
  const compras = await listarCompras()
  const totalReal = compras.reduce((s, c) => s + (c.total ?? 0), 0)

  // Serie de 9 meses: crecimiento simulado terminando en el total real del mes actual
  const base = Math.max(totalReal, 200000)
  const factores = [0.45, 0.52, 0.6, 0.68, 0.75, 0.82, 0.9, 0.95, 1]
  return factores.map((factor, i) => {
    const fecha = subMonths(new Date(), 8 - i)
    return {
      mes: format(fecha, "MMM", { locale: es }),
      ventas: Math.round(base * factor),
    }
  })
}

/**
 * Funciones más vendidas (ranking por entradas vendidas).
 * @returns {Promise<{titulo: string, entradas: number, porcentaje: number}[]>}
 */
export async function funcionesMasVendidas() {
  await simularLatencia(400)
  const [compras, funciones] = await Promise.all([
    listarCompras(),
    listarTodasFunciones(),
  ])

  // Contar entradas por película
  const conteo = {}
  for (const compra of compras) {
    const funcion = funciones.find((f) => f.id === compra.funcionId)
    const titulo = funcion?.pelicula?.titulo ?? "Desconocida"
    conteo[titulo] = (conteo[titulo] ?? 0) + (compra.entradas?.length ?? 0)
  }

  const total = Object.values(conteo).reduce((s, n) => s + n, 0) || 1
  return Object.entries(conteo)
    .map(([titulo, entradas]) => ({
      titulo,
      entradas,
      porcentaje: Math.round((entradas / total) * 100),
    }))
    .sort((a, b) => b.entradas - a.entradas)
}

/**
 * Ocupación por función (vendidos+reservados / capacidad).
 * @returns {Promise<Object[]>}
 */
export async function reporteOcupacion() {
  await simularLatencia(600)
  const funciones = await listarTodasFunciones()

  const resultado = []
  for (const f of funciones.slice(0, 12)) { // limitar para no hacer demasiadas lecturas
    const asientos = await obtenerAsientos(f.id)
    const ocupados = asientos.filter((a) => a.estado !== "disponible").length
    const capacidad = asientos.length || 1
    resultado.push({
      funcionId: f.id,
      pelicula: f.pelicula?.titulo ?? "—",
      sala: f.sala?.nombre ?? "—",
      fecha: f.fechaHora,
      ocupados,
      capacidad,
      porcentaje: Math.round((ocupados / capacidad) * 100),
    })
  }
  return resultado
}

/**
 * Reporte de entradas: usadas vs vendidas, anuladas, activas.
 * @returns {Promise<Object>}
 */
export async function reporteEntradas() {
  await simularLatencia(400)
  const compras = await listarCompras()

  let activas = 0, usadas = 0, anuladas = 0
  for (const compra of compras) {
    for (const e of compra.entradas ?? []) {
      if (e.estado === "activa")  activas++
      else if (e.estado === "usada") usadas++
      else if (e.estado === "anulada") anuladas++
    }
  }
  const total = activas + usadas + anuladas
  return { activas, usadas, anuladas, total }
}

/**
 * Convierte un array de objetos a CSV y dispara la descarga.
 * @param {Object[]} filas
 * @param {string} nombreArchivo
 */
export function exportarCSV(filas, nombreArchivo = "reporte.csv") {
  if (!filas || filas.length === 0) return

  const columnas = Object.keys(filas[0])
  const encabezado = columnas.join(",")
  const cuerpo = filas
    .map((fila) =>
      columnas
        .map((col) => {
          const valor = fila[col] ?? ""
          // Escapar comillas y envolver si contiene coma
          const str = String(valor).replace(/"/g, '""')
          return /[",\n]/.test(str) ? `"${str}"` : str
        })
        .join(",")
    )
    .join("\n")

  const csv = `${encabezado}\n${cuerpo}`
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = nombreArchivo
  link.click()
  URL.revokeObjectURL(url)
}
