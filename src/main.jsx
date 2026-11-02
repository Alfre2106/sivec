/**
 * main.jsx — Punto de entrada de la aplicación SIVEC.
 * Monta la app en el DOM con todos los proveedores globales.
 *
 * Orden de proveedores (de exterior a interior):
 *  BrowserRouter → AuthProvider → CartProvider → ToastProvider → AppRoutes
 */

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import { AuthProvider } from "@/context/AuthContext"
import { CartProvider } from "@/context/CartContext"
import { ToastProvider } from "@/components/ui/Toast"
import AppRoutes from "@/routes/AppRoutes"

import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {/* ToastProvider renderiza los toasts en un portal fuera del flujo */}
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
