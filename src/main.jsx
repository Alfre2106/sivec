/**
 * main.jsx — Punto de entrada de la aplicación SIVEC.
 * Monta la app en el DOM con todos los proveedores globales.
 *
 * Orden (de exterior a interior):
 *  ErrorBoundary → BrowserRouter → ToastProvider → AuthProvider → CartProvider → AppRoutes
 *
 * ToastProvider va ANTES de AuthProvider porque la sesión avisa con un Toast cuando
 * el servidor la da por vencida (401); y AuthProvider usa useNavigate, por eso va
 * dentro de BrowserRouter.
 */

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import ErrorBoundary from "@/components/ErrorBoundary"
import { AuthProvider } from "@/context/AuthContext"
import { CartProvider } from "@/context/CartContext"
import { ToastProvider } from "@/components/ui/Toast"
import AppRoutes from "@/routes/AppRoutes"

import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
