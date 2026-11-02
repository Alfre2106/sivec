/**
 * salas.js — Salas de cine de SIVEC.
 *
 * Sala 1: filas A–F, 12 columnas → 72 asientos
 * Sala 2: filas A–H,  10 columnas → 80 asientos
 *
 * La capacidad se calcula como filas × columnas.
 */

export const SALAS_MOCK = [
  {
    id: "s1",
    nombre: "Sala 1",
    filas: 6,        // A B C D E F
    columnas: 12,
    capacidad: 72,   // 6 × 12
    tipo: "estandar",
    activa: true,
  },
  {
    id: "s2",
    nombre: "Sala 2",
    filas: 8,        // A B C D E F G H
    columnas: 10,
    capacidad: 80,   // 8 × 10
    tipo: "vip",
    activa: true,
  },
]
