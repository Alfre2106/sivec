/**
 * Demo.jsx — Showroom de componentes base (Fase 1) + catálogo mock (pre-Fase 2).
 * Ruta: /demo   —   ELIMINAR o restringir antes de producción.
 *
 * Secciones:
 *  1.  Sidebar          (Admin + Taquillero, ítem activo vs inactivo)
 *  2.  Botones          (variantes, tamaños, estados)
 *  3.  Badges           (estados de asiento y entrada)
 *  4.  Spinners         (tres tamaños con etiqueta)
 *  5.  Toasts           (cuatro variantes)
 *  6.  StatCards        (dashboard)
 *  7.  Catálogo         (6 MovieCards con pósters SVG locales)   ← NUEVO
 *  8.  Mapa de asientos (visual, 4 estados con leyenda)          ← NUEVO
 *  9.  Cards
 *  10. Inputs
 *  11. Paleta de colores
 */

import { useState } from "react"
import {
  DollarSign, Ticket, Activity, Users,
  LayoutDashboard, Film, Building2, BarChart3,
  ShoppingCart, QrCode, History, Settings,
  MapPin as MapIcon, LogOut,
} from "lucide-react"

import Button           from "@/components/ui/Button"
import Card, { CardHeader, CardBody } from "@/components/ui/Card"
import Input            from "@/components/ui/Input"
import Badge            from "@/components/ui/Badge"
import Spinner          from "@/components/ui/Spinner"
import StatCard         from "@/components/StatCard"
import MovieCard        from "@/components/MovieCard"
import MapaAsientosDemo from "@/components/MapaAsientosDemo"
import { useToast }     from "@/components/ui/Toast"
import { cn }           from "@/utils/cn"
import { PELICULAS_MOCK } from "@/data/peliculas"

// ── Datos del Sidebar de demo ─────────────────────────────────────────────────
const ITEMS_ADMIN = [
  { icono: <LayoutDashboard />, etiqueta: "Dashboard",     activo: true  },
  { icono: <Film />,            etiqueta: "Funciones",     activo: false },
  { icono: <Building2 />,       etiqueta: "Salas",         activo: false },
  { icono: <Users />,           etiqueta: "Usuarios",      activo: false },
  { icono: <ShoppingCart />,    etiqueta: "Ventas",        activo: false },
  { icono: <BarChart3 />,       etiqueta: "Reportes",      activo: false },
  { icono: <Settings />,        etiqueta: "Configuración", activo: false },
]
const ITEMS_TAQUILLA = [
  { icono: <ShoppingCart />, etiqueta: "Venta en Taquilla",  activo: true  },
  { icono: <Film />,         etiqueta: "Funciones",          activo: false },
  { icono: <MapIcon />,      etiqueta: "Mapa de Asientos",   activo: false },
  { icono: <History />,      etiqueta: "Historial de Ventas",activo: false },
  { icono: <QrCode />,       etiqueta: "Validar Entrada",    activo: false },
]

// ── Sidebar interactivo de demo ───────────────────────────────────────────────
function SidebarDemo({ items, titulo }) {
  const [activo, setActivo] = useState(items.findIndex((i) => i.activo))
  return (
    <div className="w-56 bg-degradado-sidebar rounded-sivec overflow-hidden flex flex-col shadow-sidebar select-none">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-degradado-violeta flex items-center justify-center shrink-0">
          <Film className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <span className="font-titulo font-extrabold italic text-xl text-white tracking-tight">SIVEC</span>
      </div>
      <div className="px-4 py-2.5 border-b border-white/10">
        <span className="text-[11px] font-titulo font-semibold text-primario-claro uppercase tracking-widest">{titulo}</span>
      </div>
      <nav className="flex-1 px-3 py-3">
        <ul className="flex flex-col gap-0.5" role="list">
          {items.map((item, idx) => (
            <li key={item.etiqueta}>
              <button
                onClick={() => setActivo(idx)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-cuerpo font-medium transition-all duration-150 text-left",
                  idx === activo
                    ? "bg-primario text-white shadow-boton"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                )}
                aria-current={idx === activo ? "page" : undefined}
              >
                <span className="w-5 h-5 shrink-0 [&>svg]:w-5 [&>svg]:h-5" aria-hidden="true">{item.icono}</span>
                <span>{item.etiqueta}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-3 py-3 border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-cuerpo font-medium text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all duration-150">
          <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}

// ── Separador de sección ──────────────────────────────────────────────────────
function Seccion({ id, titulo, descripcion, children }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <h2 id={id} className="font-titulo text-xl font-bold text-gray-900 whitespace-nowrap">{titulo}</h2>
        <div className="flex-1 h-px bg-gray-200" aria-hidden="true" />
      </div>
      {descripcion && <p className="text-sm text-gray-500 font-cuerpo -mt-2">{descripcion}</p>}
      {children}
    </section>
  )
}

function FilaDemo({ etiqueta, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-titulo font-semibold text-gray-400 uppercase tracking-widest">{etiqueta}</p>
      <div className="flex flex-wrap gap-3 items-center">{children}</div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function Demo() {
  const { toast } = useToast()
  const [cargando, setCargando] = useState(false)

  const simularCarga = () => {
    setCargando(true)
    setTimeout(() => setCargando(false), 2000)
  }

  const TOASTS = [
    { tipo: "exito",       label: "✅ Éxito",       titulo: "¡Compra exitosa!",      mensaje: "Tu entrada está lista para usar."                },
    { tipo: "error",       label: "❌ Error",        titulo: "Pago rechazado",         mensaje: "Verifica los datos de tu tarjeta e inténtalo."  },
    { tipo: "advertencia", label: "⚠️ Advertencia",  titulo: "Reserva por vencer",     mensaje: "Te quedan menos de 2 minutos para completar."   },
    { tipo: "info",        label: "ℹ️ Info",          titulo: "Asiento ya ocupado",     mensaje: "Ese asiento fue tomado. Elige otro disponible." },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-14">

      {/* Encabezado */}
      <div>
        <h1 className="font-titulo text-3xl font-extrabold text-gray-900 mb-1">Sistema de Diseño SIVEC</h1>
        <p className="text-gray-500 font-cuerpo text-sm">
          Fase 1 (componentes) + datos mock (pre-Fase 2) · <span className="text-primario font-semibold">Solo para aprobación del equipo</span>
        </p>
      </div>

      {/* ── 1. SIDEBAR ──────────────────────────────────────────────────── */}
      <Seccion id="sec-sidebar" titulo="Sidebar del Panel"
        descripcion="Haz clic en cualquier ítem para cambiar el estado activo y ver el hover en los demás.">
        <div className="flex flex-wrap gap-8 items-start">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-titulo font-semibold text-gray-500 uppercase tracking-wide">Administrador</p>
            <SidebarDemo items={ITEMS_ADMIN} titulo="Administrador" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-titulo font-semibold text-gray-500 uppercase tracking-wide">Taquillero</p>
            <SidebarDemo items={ITEMS_TAQUILLA} titulo="Taquillero" />
          </div>
        </div>
      </Seccion>

      {/* ── 2. BOTONES ──────────────────────────────────────────────────── */}
      <Seccion id="sec-botones" titulo="Botones">
        <FilaDemo etiqueta="Variantes">
          <Button variante="primario">Primario</Button>
          <Button variante="secundario">Secundario</Button>
          <Button variante="fantasma">Fantasma</Button>
          <Button variante="peligro">Peligro</Button>
        </FilaDemo>
        <FilaDemo etiqueta="Tamaños">
          <Button tamaño="sm">Pequeño (sm)</Button>
          <Button tamaño="md">Mediano (md)</Button>
          <Button tamaño="lg">Grande (lg)</Button>
        </FilaDemo>
        <FilaDemo etiqueta="Estados">
          <Button cargando={cargando} onClick={simularCarga}>
            {cargando ? "Procesando..." : "Simular carga (2 s)"}
          </Button>
          <Button disabled>Deshabilitado</Button>
          <Button variante="secundario" disabled>Secundario deshabilitado</Button>
        </FilaDemo>
        <FilaDemo etiqueta="Contexto real">
          <Button tamaño="lg"><ShoppingCart className="w-4 h-4" aria-hidden="true" />Comprar Entrada</Button>
          <Button variante="secundario">Ver funciones</Button>
          <Button variante="peligro" tamaño="sm">Cancelar reserva</Button>
          <Button variante="fantasma" tamaño="sm">Volver</Button>
        </FilaDemo>
      </Seccion>

      {/* ── 3. BADGES ───────────────────────────────────────────────────── */}
      <Seccion id="sec-badges" titulo="Badges de Estado">
        <FilaDemo etiqueta="Estados de asiento">
          <Badge variante="disponible">Disponible</Badge>
          <Badge variante="reservado">Reservado</Badge>
          <Badge variante="vendido">Vendido</Badge>
        </FilaDemo>
        <FilaDemo etiqueta="Estados de entrada">
          <Badge variante="activa">Activa</Badge>
          <Badge variante="usada">Usada</Badge>
          <Badge variante="anulada">Anulada</Badge>
        </FilaDemo>
        <FilaDemo etiqueta="Generales">
          <Badge variante="primario">Primario</Badge>
          <Badge variante="exito">Éxito</Badge>
          <Badge variante="advertencia">Advertencia</Badge>
          <Badge variante="error">Error</Badge>
          <Badge variante="info">Info</Badge>
          <Badge variante="neutro">Neutro</Badge>
        </FilaDemo>
      </Seccion>

      {/* ── 4. SPINNERS ─────────────────────────────────────────────────── */}
      <Seccion id="sec-spinners" titulo="Spinners de Carga">
        <div className="flex gap-10 items-end flex-wrap">
          {[
            { tamaño: "sm", px: "16 px", uso: "En botones / inline"   },
            { tamaño: "md", px: "28 px", uso: "Sección pequeña"        },
            { tamaño: "lg", px: "48 px", uso: "Carga de página"        },
          ].map(({ tamaño, px, uso }) => (
            <div key={tamaño} className="flex flex-col items-center gap-2">
              <Spinner tamaño={tamaño} />
              <span className="text-xs text-gray-500 font-cuerpo">{tamaño} · {px}</span>
              <span className="text-[11px] text-gray-400 font-cuerpo">{uso}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-2">
            <Spinner tamaño="lg" texto="Cargando cartelera..." />
            <span className="text-[11px] text-gray-400 font-cuerpo">Con texto</span>
          </div>
        </div>
      </Seccion>

      {/* ── 5. TOASTS ───────────────────────────────────────────────────── */}
      <Seccion id="sec-toasts" titulo="Toasts (Notificaciones)"
        descripcion="Aparecen en la esquina inferior derecha y se cierran automáticamente a los 4 s.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TOASTS.map(({ tipo, label, titulo, mensaje }) => (
            <button
              key={tipo}
              onClick={() => toast({ tipo, titulo, mensaje })}
              className="tarjeta p-4 text-left flex flex-col gap-1 cursor-pointer hover:shadow-boton transition-shadow duration-200 group"
              aria-label={`Mostrar toast de ${tipo}`}
            >
              <span className="text-base">{label.split(" ")[0]}</span>
              <span className="font-titulo font-semibold text-gray-900 text-sm group-hover:text-primario transition-colors">
                {label.split(" ").slice(1).join(" ")}
              </span>
              <span className="text-[11px] text-gray-500 font-cuerpo leading-snug">{titulo}</span>
            </button>
          ))}
        </div>
      </Seccion>

      {/* ── 6. STATCARDS ─────────────────────────────────────────────────── */}
      <Seccion id="sec-statcards" titulo="StatCards del Dashboard"
        descripcion="Verde (ventas) · Azul (entradas) · Violeta claro (funciones activas) · Violeta (usuarios).">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icono={<DollarSign />} colorIcono="bg-metrica-ventas"   etiqueta="Ventas Totales"       valor="$ 12.450.000" variacion="+12% este mes" positivo />
          <StatCard icono={<Ticket />}     colorIcono="bg-metrica-entradas" etiqueta="Entradas Vendidas"    valor="2.350"        variacion="+8% este mes"  positivo />
          <StatCard icono={<Activity />}   colorIcono="bg-metrica-activas"  etiqueta="Funciones Activas"   valor="12" />
          <StatCard icono={<Users />}      colorIcono="bg-primario"         etiqueta="Usuarios Registrados" valor="847"          variacion="-2% este mes"  positivo={false} />
        </div>
      </Seccion>

      {/* ── 7. CATÁLOGO — 6 PELÍCULAS CON PÓSTERS SVG ───────────────────── */}
      <Seccion id="sec-catalogo" titulo="Catálogo de Películas (Mock)"
        descripcion="6 películas con pósters SVG locales (/public/posters/). Proporción 2:3, object-cover, object-top. Los campos marcados 'Por definir' esperan datos del equipo.">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {PELICULAS_MOCK.map((pelicula) => (
            <MovieCard
              key={pelicula.id}
              pelicula={pelicula}
              onComprar={() => toast({ tipo: "info", titulo: `Seleccionaste: ${pelicula.titulo}` })}
            />
          ))}
        </div>
        {/* Tabla de datos para verificación */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs font-cuerpo border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                {["ID","Título","Género","Clasificación","Duración","Póster","Estado"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-gray-600 font-semibold border-b border-gray-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PELICULAS_MOCK.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 text-gray-500">{p.id}</td>
                  <td className="px-3 py-2 font-semibold text-gray-800">{p.titulo}</td>
                  <td className="px-3 py-2 text-gray-600">{p.genero}</td>
                  <td className="px-3 py-2"><Badge variante="neutro">{p.clasificacion}</Badge></td>
                  <td className="px-3 py-2 text-gray-600">{p.duracion} min</td>
                  <td className="px-3 py-2 text-primario truncate max-w-[140px]">{p.poster}</td>
                  <td className="px-3 py-2"><Badge variante={p.estado === "activa" ? "exito" : "neutro"}>{p.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Seccion>

      {/* ── 8. MAPA DE ASIENTOS VISUAL ───────────────────────────────────── */}
      <Seccion id="sec-mapa" titulo="Mapa de Asientos (Visual)"
        descripcion="Solo de presentación. Los 4 estados con sus colores: disponible (gris claro), seleccionado (violeta), reservado (ámbar), vendido (gris oscuro). El mapa interactivo con lógica de compra se construirá en la Fase 2.">
        <div className="tarjeta p-6 max-w-2xl">
          <MapaAsientosDemo />
        </div>
      </Seccion>

      {/* ── 9. CARDS ─────────────────────────────────────────────────────── */}
      <Seccion id="sec-cards" titulo="Cards">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <Card>
            <CardHeader><h3 className="font-titulo font-bold text-gray-900">Tarjeta básica</h3></CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 font-cuerpo">
                Bordes redondeados, sombra suave violeta y fondo blanco. Usada para resúmenes, detalles de función, etc.
              </p>
            </CardBody>
          </Card>
          <Card className="border-primario/20">
            <CardBody>
              <p className="font-titulo font-semibold text-gray-800 mb-1">Tarjeta compacta</p>
              <p className="text-sm text-gray-500 font-cuerpo mb-3">Sin header ni footer.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variante="activa">Activa</Badge>
                <Badge variante="usada">Usada</Badge>
                <Badge variante="vendido">Vendido</Badge>
              </div>
            </CardBody>
          </Card>
        </div>
      </Seccion>

      {/* ── 10. INPUTS ───────────────────────────────────────────────────── */}
      <Seccion id="sec-inputs" titulo="Inputs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <Input etiqueta="Correo electrónico" placeholder="usuario@ejemplo.com" tipo="email" />
          <Input etiqueta="Contraseña" placeholder="••••••••" tipo="password" />
          <Input etiqueta="Con error" placeholder="Campo con error" error="Este campo es requerido" />
          <Input etiqueta="Deshabilitado" placeholder="No editable" disabled />
        </div>
      </Seccion>

      {/* ── 11. PALETA ───────────────────────────────────────────────────── */}
      <Seccion id="sec-paleta" titulo="Paleta de Colores">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { nombre: "Primario",            clase: "bg-primario" },
            { nombre: "Primario oscuro",     clase: "bg-primario-oscuro" },
            { nombre: "Noche",               clase: "bg-noche" },
            { nombre: "Noche oscuro",        clase: "bg-noche-oscuro" },
            { nombre: "Éxito (verde)",       clase: "bg-exito" },
            { nombre: "Error (rojo)",        clase: "bg-error" },
            { nombre: "Advertencia (ámbar)", clase: "bg-advertencia" },
            { nombre: "Info (azul)",         clase: "bg-info" },
          ].map((c) => (
            <div key={c.nombre} className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl shrink-0", c.clase)} aria-hidden="true" />
              <span className="text-sm font-cuerpo text-gray-700">{c.nombre}</span>
            </div>
          ))}
        </div>
      </Seccion>

    </div>
  )
}
