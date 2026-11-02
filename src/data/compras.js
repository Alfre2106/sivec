/**
 * compras.js — Compras y entradas de ejemplo para el usuario cliente de prueba.
 * Se usan para poblar "Mis compras" y el historial del taquillero.
 */

import { subDays } from "date-fns"

// Genera una fecha pasada para compras históricas
const hace = (dias) => subDays(new Date(), dias).toISOString()

export const COMPRAS_MOCK = [
  {
    id: "c1",
    usuarioId: "u1",
    funcionId: "f3",  // Deadpool & Wolverine
    asientos: ["f3-A4"],
    total: 18000,
    metodoPago: "tarjeta",
    fechaCompra: hace(5),
    estado: "confirmada",
    entradas: [
      {
        id: "e1",
        compraId: "c1",
        asiento: "A4",
        codigo: "SVC-2024-000001",
        estado: "activa",  // activa | usada | anulada
        fechaUso: null,
      },
    ],
  },
  {
    id: "c2",
    usuarioId: "u1",
    funcionId: "f5",  // Moana 2
    asientos: ["f5-D5", "f5-D6"],
    total: 30000,
    metodoPago: "tarjeta",
    fechaCompra: hace(2),
    estado: "confirmada",
    entradas: [
      {
        id: "e2",
        compraId: "c2",
        asiento: "D5",
        codigo: "SVC-2024-000002",
        estado: "activa",
        fechaUso: null,
      },
      {
        id: "e3",
        compraId: "c2",
        asiento: "D6",
        codigo: "SVC-2024-000003",
        estado: "activa",
        fechaUso: null,
      },
    ],
  },
]

// Contador para generar códigos únicos de entrada en tiempo de ejecución
export let contadorEntradas = 4
