/**
 * compras.js — Compras y entradas de ejemplo.
 *
 * Cubre los tres estados de entrada:
 *   e01 — activa   (lista para usar)
 *   e02 — usada    (ya fue escaneada)
 *   e03 — anulada  (función f09 fue cancelada)
 *
 * Usuarios:
 *   u1 = cliente@sivec.com
 *   u2 = taquillero@sivec.com
 *   u3 = admin@sivec.com
 */

import { subDays, subHours } from "date-fns"

const hace = (dias) => subDays(new Date(), dias).toISOString()

export const COMPRAS_MOCK = [
  // ── Compra 1: entrada activa ──────────────────────────────────────────────
  {
    id: "c01",
    usuarioId: "u1",
    funcionId: "f07",          // Deadpool & Wolverine — función futura
    asientos: ["f07-C3"],
    total: 20000,
    metodoPago: "tarjeta",
    fechaCompra: hace(2),
    estado: "confirmada",
    entradas: [
      {
        id: "e01",
        compraId: "c01",
        funcionId: "f07",
        asiento: "C3",
        asientoId: "f07-C3",
        codigo: "SVC-2026-000001",
        estado: "activa",
        fechaUso: null,
      },
    ],
  },

  // ── Compra 2: entrada ya usada ────────────────────────────────────────────
  {
    id: "c02",
    usuarioId: "u1",
    funcionId: "f01",          // Intensa-Mente 2 — función de hoy
    asientos: ["f01-D1"],
    total: 20000,
    metodoPago: "tarjeta",
    fechaCompra: hace(1),
    estado: "confirmada",
    entradas: [
      {
        id: "e02",
        compraId: "c02",
        funcionId: "f01",
        asiento: "D1",
        asientoId: "f01-D1",
        codigo: "SVC-2026-000002",
        estado: "usada",
        fechaUso: subHours(new Date(), 2).toISOString(),  // escaneada hace 2 h
      },
    ],
  },

  // ── Compra 3: entrada anulada (función cancelada) ─────────────────────────
  {
    id: "c03",
    usuarioId: "u1",
    funcionId: "f09",          // Deadpool & Wolverine — función cancelada
    asientos: ["f09-A2"],
    total: 20000,
    metodoPago: "tarjeta",
    fechaCompra: hace(3),
    estado: "confirmada",
    entradas: [
      {
        id: "e03",
        compraId: "c03",
        funcionId: "f09",
        asiento: "A2",
        asientoId: "f09-A2",
        codigo: "SVC-2026-000003",
        estado: "anulada",    // función cancelada → entrada anulada
        fechaUso: null,
      },
    ],
  },
]

// Contador global para nuevos códigos generados en tiempo de ejecución
export let contadorEntradas = 4
