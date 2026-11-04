/**
 * Landing.jsx — Página de inicio pública de SIVEC.
 * Hero con foto de sala + degradado, CTA "Comprar Entrada", sección de películas destacadas.
 */

import { useNavigate } from "react-router-dom"
import { Ticket, Star, Shield, Clock } from "lucide-react"
import Button from "@/components/ui/Button"
import MovieCard from "@/components/MovieCard"
import { listarPeliculas } from "@/services/peliculasService"
import { useCallback, useEffect, useRef, useState } from "react"
import Spinner from "@/components/ui/Spinner"
import MensajeError from "@/components/ui/MensajeError"
import EstadoVacio from "@/components/ui/EstadoVacio"
import { fueCancelada, mensajeDeError } from "@/services/apiClient"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/components/ui/Toast"

// Características del servicio
const FEATURES = [
  { icono: <Ticket />,  titulo: "Compra en línea",    texto: "Reserva y paga tus entradas sin hacer fila." },
  { icono: <Star />,    titulo: "Los mejores estrenos",texto: "Las películas más recientes en cartelera."    },
  { icono: <Shield />,  titulo: "Pago seguro",         texto: "Transacciones protegidas y garantizadas."    },
  { icono: <Clock />,   titulo: "Reserva por 5 min",   texto: "Bloquea tus asientos mientras completas el pago." },
]

export default function Landing() {
  const navigate = useNavigate()
  const { autenticado } = useAuth()
  const { toast } = useToast()
  const [peliculas, setPeliculas] = useState([])

  // Sin sesión, "Comprar" lleva al login; al entrar se vuelve a la cartelera.
  const comprar = () => {
    if (!autenticado) {
      toast({ tipo: "info", titulo: "Inicia sesión para comprar", mensaje: "Después podrás elegir tu función." })
      navigate("/login", { state: { desde: { pathname: "/cartelera" } } })
      return
    }
    navigate("/cartelera")
  }
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)
  const ctrl = useRef(null)

  const cargar = useCallback(() => {
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    setCargando(true)
    setError(null)
    listarPeliculas({ signal: c.signal })
      .then((data) => setPeliculas(data.slice(0, 4)))
      .catch((e) => {
        if (fueCancelada(e)) return
        setError(mensajeDeError(e, "No pudimos cargar la cartelera."))
      })
      .finally(() => { if (!c.signal.aborted) setCargando(false) })
  }, [])

  useEffect(() => {
    cargar()
    return () => ctrl.current?.abort()
  }, [cargar])

  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[520px] flex items-center bg-noche-oscuro overflow-hidden"
        aria-label="Bienvenida a SIVEC"
      >
        {/* Imagen de fondo real */}
        <img
          src="/hero-fondo.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        {/* Overlay oscuro con degradado violeta para legibilidad del texto */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-noche-oscuro/95 via-noche-oscuro/80 to-noche-oscuro/40"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-2 gap-10 items-center">
          {/* Texto */}
          <div className="flex flex-col gap-6 animacion-entrada">
            <div className="inline-flex">
              <span className="bg-primario/30 text-primario-claro text-xs font-titulo font-semibold px-3 py-1 rounded-full border border-primario/40">
                🎬 Sistema de Venta de Entradas
              </span>
            </div>
            <h1 className="font-titulo font-extrabold italic text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
              SIVEC
              <span className="block text-2xl sm:text-3xl font-bold not-italic text-primario-claro mt-1">
                Entradas para Cine y Eventos
              </span>
            </h1>
            <p className="text-gray-300 font-cuerpo text-lg leading-relaxed max-w-md">
              Compra, reserva y disfruta tus películas y eventos favoritos. Elige tus asientos y paga en segundos.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                tamaño="lg"
                onClick={() => navigate("/cartelera")}
                aria-label="Ver cartelera y comprar entradas"
              >
                <Ticket className="w-5 h-5" aria-hidden="true" />
                Comprar Entrada
              </Button>
              <Button
                variante="secundario"
                tamaño="lg"
                onClick={() => navigate("/cartelera")}
                className="border-white/40 text-white hover:bg-white/10 hover:text-white"
              >
                Ver Cartelera
              </Button>
            </div>
          </div>

          {/* Tarjeta decorativa */}
          <div className="hidden md:flex justify-center animacion-entrada">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-sivec p-6 flex flex-col gap-4 w-72">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-degradado-violeta flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-white font-titulo font-bold text-sm">Entrada Digital</p>
                  <p className="text-gray-400 text-xs font-cuerpo">Con código QR único</p>
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex flex-col gap-2 text-sm font-cuerpo text-gray-300">
                <div className="flex justify-between"><span>Película</span><span className="text-white font-semibold">Intensa-Mente 2</span></div>
                <div className="flex justify-between"><span>Sala</span><span className="text-white font-semibold">Sala 1</span></div>
                <div className="flex justify-between"><span>Asiento</span><span className="text-primario-claro font-bold">C5</span></div>
              </div>
              <div className="bg-white rounded-lg p-2 flex justify-center">
                <div className="w-20 h-20 bg-gray-100 rounded grid grid-cols-5 gap-px p-1" aria-hidden="true">
                  {/* Patrón QR decorativo determinista (no es un QR real) */}
                  {[1,0,1,1,0, 0,1,1,0,1, 1,1,0,1,0, 0,1,0,1,1, 1,0,1,0,1].map((v, i) => (
                    <div key={i} className={`rounded-[1px] ${v ? "bg-gray-800" : "bg-white"}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Características ──────────────────────────────────────────── */}
      <section className="bg-fondo-panel py-12" aria-label="Características del servicio">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icono, titulo, texto }) => (
              <div key={titulo} className="flex flex-col items-center text-center gap-3 p-4 animacion-entrada">
                <div className="w-12 h-12 rounded-xl bg-primario-suave flex items-center justify-center text-primario [&>svg]:w-6 [&>svg]:h-6">
                  {icono}
                </div>
                <h3 className="font-titulo font-bold text-gray-900 text-sm">{titulo}</h3>
                <p className="text-gray-500 text-xs font-cuerpo leading-relaxed">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Películas destacadas ─────────────────────────────────────── */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" aria-labelledby="titulo-destacadas">
        <div className="flex items-center justify-between mb-8">
          <h2 id="titulo-destacadas" className="font-titulo text-2xl font-bold text-gray-900">
            En Cartelera Ahora
          </h2>
          <Button variante="fantasma" tamaño="sm" onClick={() => navigate("/cartelera")}>
            Ver todas →
          </Button>
        </div>

        {cargando ? (
          <div className="flex justify-center py-16">
            <Spinner tamaño="lg" texto="Cargando cartelera..." />
          </div>
        ) : error ? (
          <MensajeError className="py-10" mensaje={error} onReintentar={cargar} />
        ) : peliculas.length === 0 ? (
          <EstadoVacio
            className="py-10"
            icono={<Ticket />}
            titulo="Cartelera vacía"
            descripcion="Por ahora no hay películas en cartelera. Vuelve pronto."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {peliculas.map((p) => (
              <MovieCard
                key={p.id}
                pelicula={p}
                onComprar={() => comprar(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA final ────────────────────────────────────────────────── */}
      <section id="contacto" className="bg-degradado-violeta py-16 text-center" aria-label="Llamada a la acción">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-titulo text-3xl font-extrabold text-white mb-4">
            ¿Listo para tu próxima película?
          </h2>
          <p className="text-white/80 font-cuerpo mb-8">
            Regístrate gratis y disfruta de la mejor experiencia de compra de entradas.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              tamaño="lg"
              onClick={() => navigate("/registro")}
              className="bg-white text-primario hover:bg-gray-50 shadow-boton"
            >
              Crear cuenta gratis
            </Button>
            <Button
              variante="fantasma"
              tamaño="lg"
              onClick={() => navigate("/cartelera")}
              className="text-white border-white/40 hover:bg-white/10 hover:text-white"
            >
              Ver cartelera
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
