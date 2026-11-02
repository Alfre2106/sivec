/**
 * main.jsx — Punto de entrada de la aplicación SIVEC.
 * Monta la app en el DOM con todos los proveedores globales.
 */

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import { AuthProvider } from "@/context/AuthContext"
import { CartProvider } from "@/context/CartContext"
import AppRoutes from "@/routes/AppRoutes"

import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* BrowserRouter habilita la navegación con React Router v6 */}
    <BrowserRouter>
      {/* AuthProvider: sesión y autenticación global */}
      <AuthProvider>
        {/* CartProvider: carrito de asientos y reservas */}
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
