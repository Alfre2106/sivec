/**
 * menuConfig.jsx — Configuración de los items del Sidebar por rol.
 *
 * Cada entry tiene: { a, etiqueta, icono, end? }
 * Se importa en PanelLayout para pasar al Sidebar.
 */

import {
  LayoutDashboard,
  Film,
  Building2,
  Users,
  BarChart3,
  ShoppingCart,
  QrCode,
  History,
} from "lucide-react"

export const MENU_TAQUILLA = [
  {
    a: "/panel/taquilla",
    etiqueta: "Venta en Taquilla",
    icono: <ShoppingCart />,
    end: true,
  },
  {
    a: "/panel/taquilla/validar",
    etiqueta: "Validar Entrada",
    icono: <QrCode />,
  },
  {
    a: "/panel/taquilla/historial",
    etiqueta: "Historial de Ventas",
    icono: <History />,
  },
]

export const MENU_ADMIN = [
  {
    a: "/panel/admin",
    etiqueta: "Dashboard",
    icono: <LayoutDashboard />,
    end: true,
  },
  {
    a: "/panel/admin/funciones",
    etiqueta: "Funciones",
    icono: <Film />,
  },
  {
    a: "/panel/admin/salas",
    etiqueta: "Salas",
    icono: <Building2 />,
  },
  {
    a: "/panel/admin/usuarios",
    etiqueta: "Usuarios",
    icono: <Users />,
  },
  {
    a: "/panel/admin/reportes",
    etiqueta: "Reportes",
    icono: <BarChart3 />,
  },
]
