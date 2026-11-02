/**
 * Componentes.jsx — Showroom de componentes base para aprobación del equipo.
 * Ruta: /componentes
 *
 * Muestra en una sola página:
 *  1. Sidebar (con ítems activos e inactivos simulados)
 *  2. Todas las variantes de Button
 *  3. Variantes de Card
 *  4. StatCards con los colores del mockup (violeta, azul, verde)
 *
 * ELIMINAR o restringir antes de producción.
 */

import { useState } from "react"
import {
  LayoutDashboard, Film, Building2, Users, BarChart3,
  ShoppingCart, QrCode, History,
  DollarSign, Ticket, Activity, Eye,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import Button from "@/components/ui/Button"
import Card, { CardHeader, CardBody, CardFooter } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import StatCard from "@/components/StatCard"
import { cn } from "@/utils/cn"

// ── Datos para el Sidebar de demostración ────────────────────────────────────
// Simulamos que /panel/admin es la ruta "activa" y las demás son inactivas.
const ITEMS_SIDEBAR_DEMO = [
  { a: "/panel/admin",           icono: <LayoutDashboard />, etiqueta: "Dashboard",  activo: true  },
  { a: "/panel/admin/funciones", icono: <Film />,            etiqueta: "Funciones",  activo: false },
  { a: "/panel/admin/salas",     icono: <Building2 />,       etiqueta: "Salas",      activo: false },
  { a: "/panel/admin/usuarios",  icono: <Users />,           etiqueta: "Usuarios",   activo: false },
  { a: "/panel/admin/reportes",  icono: <BarChart3 />,       etiqueta: "Reportes",   activo: false },
]

const ITEMS_TAQUILLA_DEMO = [
  { a: "/panel/taquilla",          icono: <ShoppingCart />, etiqueta: "Venta en Taquilla", activo: true  },
  { a: "/panel/taquilla/validar",  icono: <QrCode />,       etiqueta: "Validar Entrada",   activo: false },
  { a: "/panel/taquilla/historial",icono: <History />,      etiqueta: "Historial Ventas",  activo: false },
]

// ── StatCards idénticos al mockup ─────────────────────────────────────────────
const STAT_CARDS = [
  {
    icono: <DollarSign />,
    colorIcono: "bg-metrica-ventas",   // verde — igual al mockup
    etiqueta: "Ventas Totales",
    valor: "$ 12.450.000",
    variacion: "+12% este mes",
    positivo: true,
  },
  {
    icono: <Ticket />,
    colorIcono: "bg-metrica-entradas", // azul — igual al mockup
    etiqueta: "Entradas Vendidas",
    valor: "2.350",
    variacion: "+8% este mes",
    positivo: true,
  },
  {
    icono: <Activity />,
    colorIcono: "bg-metrica-activas",  // violeta — igual al mockup
    etiqueta: "Funciones Activas",
    valor: "12",
  },
  {
    icono: <Eye />,
    colorIcono: "bg-primario",         // violeta oscuro
    etiqueta: "Ocupación Promedio",
    valor: "78%",
    variacion: "-3% este mes",
    positivo: false,
  },
]

// ── Componente Sidebar de demostración (sin router real) ─────────────────────
function SidebarDemo({ items, titulo }) {
  return (
    <div className="w-56 bg-degradado-sidebar rounded-sivec overflow-hidden flex flex-col shadow-sidebar">
      {/* Cabecera */}
      <div className="px-4 py-4 border-b border-white/10 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-degradado-violeta flex items-center justify-center">
          <Film className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <span className="font-titulo font-extrabold italic text-lg text-white">SIVEC</span>
      </div>

      {/* Etiqueta del panel */}
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-xs text-primario-claro font-titulo font-semibold uppercase tracking-wider">
          {titulo}
        </p>
      </div>

      {/* Items */}
      <nav className="flex-1 px-3 py-3">
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.etiqueta}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-cuerpo font-medium",
                  item.activo
                    ? "bg-primario text-white shadow-boton"
                    : "text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer"
                )}
                aria-current={item.activo ? "page" : undefined}
              >
                <span className="w-5 h-5 shrink-0 [&>svg]:w-5 [&>svg]:h-5" aria-hidden="true">
                  {item.icono}
                </span>
                <span>{item.etiqueta}</span>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

// ── Sección con título ────────────────────────────────────────────────────────
function Seccion({ id, titulo, children }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <h2 id={id} className="font-titulo text-xl font-bold text-gray-900">
          {titulo}
        </h2>
        <div className="flex-1 h-px bg-gray-200" aria-hidden="true" />
      </div>
      {children}
    </section>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Componentes() {
  const [cargando, setCargando] = useState(false)

  const simularCarga = () => {
    setCargando(true)
    setTimeout(() => setCargando(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-14">

      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-titulo text-3xl font-extrabold text-gray-900">
            Componentes Base — SIVEC
          </h1>
          <p className="text-gray-500 font-cuerpo mt-1">
            Showroom de aprobación · Fase 1
          </p>
        </div>
        <NavLink
          to="/"
          className="text-sm text-primario font-cuerpo hover:underline"
        >
          ← Volver al inicio
        </NavLink>
      </div>

      {/* ── 1. SIDEBAR ──────────────────────────────────────────────────── */}
      <Seccion id="sec-sidebar" titulo="Sidebar del Panel">
        <p className="text-sm text-gray-500 font-cuerpo -mt-2">
          Ítem activo resaltado en violeta · Ítems inactivos en gris · Dos variantes de menú (Admin / Taquilla).
        </p>
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-titulo font-semibold text-gray-600 uppercase tracking-wide">
              Administrador
            </p>
            <SidebarDemo items={ITEMS_SIDEBAR_DEMO} titulo="Admin" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-titulo font-semibold text-gray-600 uppercase tracking-wide">
              Taquillero
            </p>
            <SidebarDemo items={ITEMS_TAQUILLA_DEMO} titulo="Taquilla" />
          </div>
        </div>
      </Seccion>

      {/* ── 2. BOTONES ──────────────────────────────────────────────────── */}
      <Seccion id="sec-botones" titulo="Botones">

        {/* Por variante */}
        <div>
          <p className="text-xs font-titulo font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Variantes
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variante="primario">Primario</Button>
            <Button variante="secundario">Secundario</Button>
            <Button variante="fantasma">Fantasma</Button>
            <Button variante="peligro">Peligro</Button>
          </div>
        </div>

        {/* Por tamaño */}
        <div>
          <p className="text-xs font-titulo font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Tamaños
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Button tamaño="sm">Pequeño (sm)</Button>
            <Button tamaño="md">Mediano (md)</Button>
            <Button tamaño="lg">Grande (lg)</Button>
          </div>
        </div>

        {/* Estados */}
        <div>
          <p className="text-xs font-titulo font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Estados
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Button cargando={cargando} onClick={simularCarga}>
              {cargando ? "Procesando pago..." : "Simular carga (2s)"}
            </Button>
            <Button disabled>Deshabilitado</Button>
            <Button variante="secundario" disabled>Secundario deshabilitado</Button>
          </div>
        </div>

        {/* Contexto real de uso */}
        <div>
          <p className="text-xs font-titulo font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Contexto de uso
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Button tamaño="lg">🎟 Comprar Entrada</Button>
            <Button variante="secundario" tamaño="md">Ver funciones</Button>
            <Button variante="peligro" tamaño="sm">Cancelar reserva</Button>
            <Button variante="fantasma" tamaño="sm">Volver</Button>
          </div>
        </div>
      </Seccion>

      {/* ── 3. TARJETAS ──────────────────────────────────────────────────── */}
      <Seccion id="sec-cards" titulo="Tarjetas (Cards)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Card básica */}
          <Card>
            <CardHeader>
              <h3 className="font-titulo font-bold text-gray-900 text-base">
                Tarjeta básica
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 font-cuerpo">
                Bordes muy redondeados, sombra suave violeta y fondo blanco. Usada para resúmenes de compra, detalles de función, etc.
              </p>
            </CardBody>
            <CardFooter>
              <div className="flex gap-2">
                <Button tamaño="sm">Confirmar</Button>
                <Button variante="fantasma" tamaño="sm">Cancelar</Button>
              </div>
            </CardFooter>
          </Card>

          {/* Card de función */}
          <Card>
            <CardHeader className="bg-noche-oscuro rounded-t-sivec">
              <p className="text-xs text-primario-claro font-cuerpo font-semibold uppercase tracking-wide">
                Función activa
              </p>
              <h3 className="font-titulo font-bold text-white text-lg mt-0.5">
                Intensamente 2
              </h3>
            </CardHeader>
            <CardBody className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm font-cuerpo">
                <span className="text-gray-500">Sala</span>
                <span className="font-semibold text-gray-900">Sala 1</span>
              </div>
              <div className="flex items-center justify-between text-sm font-cuerpo">
                <span className="text-gray-500">Formato</span>
                <span className="font-semibold text-gray-900">2D · Español</span>
              </div>
              <div className="flex items-center justify-between text-sm font-cuerpo">
                <span className="text-gray-500">Precio</span>
                <span className="font-semibold text-primario">$ 15.000</span>
              </div>
            </CardBody>
            <CardFooter>
              <div className="flex items-center justify-between">
                <Badge variante="exito">Disponible</Badge>
                <Button tamaño="sm">Seleccionar</Button>
              </div>
            </CardFooter>
          </Card>

          {/* Card de estado */}
          <Card className="border-primario/30 bg-primario-suave">
            <CardBody className="flex flex-col gap-3">
              <Badge variante="primario" className="self-start">Reserva activa</Badge>
              <p className="font-titulo font-bold text-gray-900 text-base">
                Resumen de tu compra
              </p>
              <div className="text-sm font-cuerpo text-gray-700 flex flex-col gap-1">
                <span>Asientos: <strong>F5, F6</strong></span>
                <span>Total: <strong className="text-primario">$ 40.000</strong></span>
              </div>
              <div className="flex gap-2 mt-1">
                <Button tamaño="sm" className="flex-1">Proceder al pago</Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </Seccion>

      {/* ── 4. STATCARDS ─────────────────────────────────────────────────── */}
      <Seccion id="sec-statcards" titulo="StatCards del Dashboard">
        <p className="text-sm text-gray-500 font-cuerpo -mt-2">
          Colores según el mockup: verde (ventas), azul (entradas), violeta claro (funciones activas), violeta oscuro (adicional).
        </p>

        {/* Fila principal — idéntica al mockup */}
        <div>
          <p className="text-xs font-titulo font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Fila del dashboard (igual al mockup)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS.map((card) => (
              <StatCard key={card.etiqueta} {...card} />
            ))}
          </div>
        </div>

        {/* Muestra de colores de icono disponibles */}
        <div>
          <p className="text-xs font-titulo font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Tokens de color disponibles para iconos
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            {[
              { clase: "bg-metrica-ventas",   nombre: "bg-metrica-ventas (verde)" },
              { clase: "bg-metrica-entradas", nombre: "bg-metrica-entradas (azul)" },
              { clase: "bg-metrica-activas",  nombre: "bg-metrica-activas (violeta claro)" },
              { clase: "bg-primario",         nombre: "bg-primario (violeta)" },
              { clase: "bg-primario-oscuro",  nombre: "bg-primario-oscuro" },
            ].map((c) => (
              <div key={c.nombre} className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-xl", c.clase)} aria-hidden="true" />
                <span className="text-xs font-cuerpo text-gray-600">{c.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </Seccion>

      {/* ── 5. BADGES ─────────────────────────────────────────────────────── */}
      <Seccion id="sec-badges" titulo="Badges de Estado">
        <div className="flex flex-wrap gap-2">
          <Badge variante="primario">Primario</Badge>
          <Badge variante="exito">Activa ✓</Badge>
          <Badge variante="advertencia">Reservado ⏳</Badge>
          <Badge variante="error">Anulada ✕</Badge>
          <Badge variante="info">Subtitulado</Badge>
          <Badge variante="neutro">Todo público</Badge>
        </div>
      </Seccion>

    </div>
  )
}
