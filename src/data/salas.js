/**
 * salas.js — Salas de cine disponibles en SIVEC.
 * Cada sala define su número de filas y columnas para el mapa de asientos.
 */

export const SALAS_MOCK = [
  {
    id: "s1",
    nombre: "Sala 1",
    capacidad: 48,  // 6 filas × 8 columnas
    filas: 6,       // A, B, C, D, E, F
    columnas: 8,
    tipo: "estandar",
    activa: true,
  },
  {
    id: "s2",
    nombre: "Sala 2",
    capacidad: 48,
    filas: 6,
    columnas: 8,
    tipo: "vip",
    activa: true,
  },
]
