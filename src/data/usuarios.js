/**
 * usuarios.js — Usuarios de prueba para el sistema SIVEC.
 * Roles: "cliente", "taquillero", "admin"
 */

export const USUARIOS_MOCK = [
  {
    id: "u1",
    nombre: "Ana García",
    email: "cliente@sivec.com",
    password: "123456",
    rol: "cliente",
    telefono: "300-111-2222",
    documento: "12345678",
    fechaRegistro: "2024-03-15",
    activo: true,
  },
  {
    id: "u2",
    nombre: "Carlos López",
    email: "taquillero@sivec.com",
    password: "123456",
    rol: "taquillero",
    telefono: "300-333-4444",
    documento: "87654321",
    fechaRegistro: "2024-01-10",
    activo: true,
  },
  {
    id: "u3",
    nombre: "María Rodríguez",
    email: "admin@sivec.com",
    password: "123456",
    rol: "admin",
    telefono: "300-555-6666",
    documento: "11223344",
    fechaRegistro: "2023-12-01",
    activo: true,
  },
]
