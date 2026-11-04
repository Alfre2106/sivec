/**
 * Cartelera.jsx — Listado de películas disponibles con sus funciones.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, SlidersHorizontal } from "lucide-react"
import { listarPeliculas } from "@/services/peliculasService"
import { funcionesPorPelicula } from "@/services/funcionesService"
import { useCart } from "@/context/CartContext"
import MovieCard from "@/components/MovieCard"
import Spinner from "@/components/ui/Spinner"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Input from "@/components/ui/Input"
import MensajeError from "@/components/ui/MensajeError"
import EstadoVacio from "@/components/ui/EstadoVacio"
import { Film } from "lucide-react"
import Poster from "@/components/Poster"
import AvisoDisponibilidad from "@/components/AvisoDisponibilidad"
import { estaAgotada } from "@/utils/disponibilidad"
import { fueCancelada, mensajeDeError } from "@/services/apiClient"
import { formatearDiaCorto, formatearHora, formatearFechaCorta } from "@/utils/fechas"
import { formatearPrecio } from "@/utils/formato"
import { useRefrescoAlEnfocar } from "@/hooks/useRefrescoAlEnfocar"
import { cn } from "@/utils/cn"

export default function Cartelera() {
  const navigate = useNavigate()
  const { seleccionarFuncion } = useCart()

  const [peliculas, setPeliculas]       = useState([])
  const [cargando, setCargando]         = useState(true)
  const [busqueda, setBusqueda]         = useState("")
  const [generoFiltro, setGeneroFiltro] = useState("Todos")
  const [peliculaModal, setPeliculaModal] = useState(null)  // película seleccionada para ver funciones
  const [funciones, setFunciones]       = useState([])
  const [cargandoFunc, setCargandoFunc] = useState(false)
  const [errorFunc, setErrorFunc]       = useState(null)
  const ctrlFunc = useRef(null)
  const [error, setError]               = useState(null)

  // Carga/recarga la lista de películas
  const ctrlPeliculas = useRef(null)
  const cargarDatos = useCallback((silencioso = false) => {
    ctrlPeliculas.current?.abort()
    const ctrl = new AbortController()
    ctrlPeliculas.current = ctrl
    if (!silencioso) setCargando(true)
    setError(null)
    listarPeliculas({ signal: ctrl.signal })
      .then(setPeliculas)
      .catch((e) => {
        if (fueCancelada(e)) return
        setError(mensajeDeError(e, "No pudimos cargar la cartelera."))
      })
      .finally(() => { if (!ctrl.signal.aborted) setCargando(false) })
  }, [])

  const cargarFunciones = useCallback((pelicula) => {
    ctrlFunc.current?.abort()
    const ctrl = new AbortController()
    ctrlFunc.current = ctrl
    setCargandoFunc(true)
    setErrorFunc(null)
    funcionesPorPelicula(pelicula.id, { signal: ctrl.signal })
      .then(setFunciones)
      .catch((e) => {
        if (fueCancelada(e)) return
        setFunciones([])
        setErrorFunc(mensajeDeError(e, "No pudimos cargar las funciones."))
      })
      .finally(() => { if (!ctrl.signal.aborted) setCargandoFunc(false) })
  }, [])

  useEffect(() => {
    cargarDatos()
    return () => { ctrlPeliculas.current?.abort(); ctrlFunc.current?.abort() }
  }, [cargarDatos])

  // Al volver a esta pestaña, recargar para reflejar cambios del admin (precios, cupos, etc.)
  useRefrescoAlEnfocar(() => {
    cargarDatos(true)
    if (peliculaModal) cargarFunciones(peliculaModal)
  })
  // Géneros únicos para el filtro
  const generos = ["Todos", ...new Set(peliculas.map((p) => (p.genero ?? "").split(" / ")[0]).filter(Boolean))]

  const peliculasFiltradas = peliculas.filter((p) => {
    const coincideBusqueda = p.titulo.toLowerCase().includes(busqueda.toLowerCase())
    const coincideGenero   = generoFiltro === "Todos" || (p.genero ?? "").includes(generoFiltro)
    return coincideBusqueda && coincideGenero
  })

  const abrirFunciones = (pelicula) => {
    setPeliculaModal(pelicula)
    setFunciones([])
    cargarFunciones(pelicula)
  }

  const cerrarPanel = () => {
    ctrlFunc.current?.abort()
    setPeliculaModal(null)
  }
  const irAAsientos = (funcion) => {
    seleccionarFuncion(funcion)
    navigate(`/funcion/${funcion.id}/asientos`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="font-titulo text-3xl font-bold text-gray-900">Cartelera</h1>
        <p className="text-gray-500 font-cuerpo mt-1">Selecciona una película para ver las funciones disponibles</p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Buscar película..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            icono={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
          {generos.map((g) => (
            <button
              key={g}
              onClick={() => setGeneroFiltro(g)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-cuerpo font-semibold whitespace-nowrap transition-colors",
                generoFiltro === g
                  ? "bg-primario text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-primario-suave hover:text-primario"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de películas */}
      {cargando ? (
        <div className="flex justify-center py-20">
          <Spinner tamaño="lg" texto="Cargando cartelera..." />
        </div>
      ) : error ? (
        <MensajeError mensaje={error} onReintentar={() => cargarDatos()} />
      ) : peliculasFiltradas.length === 0 ? (
        <EstadoVacio
          icono={<Film />}
          titulo={peliculas.length === 0 ? "Cartelera vacía" : "Sin resultados"}
          descripcion={peliculas.length === 0
            ? "Por ahora no hay películas en cartelera. Vuelve pronto."
            : "No se encontraron películas con ese criterio de búsqueda."}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {peliculasFiltradas.map((p) => (
            <MovieCard
              key={p.id}
              pelicula={p}
              onComprar={() => abrirFunciones(p)}
            />
          ))}
        </div>
      )}

      {/* Panel de funciones (slide-in desde la derecha al seleccionar película) */}
      {peliculaModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={cerrarPanel}
            aria-hidden="true"
          />
          <aside
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animacion-entrada overflow-y-auto"
            aria-label="Funciones disponibles"
          >
            {/* Cabecera */}
            <div className="sticky top-0 bg-noche-oscuro px-5 py-4 flex items-start gap-4">
              <Poster
                src={peliculaModal.poster}
                alt={peliculaModal.titulo}
                className="w-16 rounded-lg object-cover object-top shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h2 className="font-titulo font-bold text-white text-lg leading-tight">
                  {peliculaModal.titulo}
                </h2>
                <p className="text-gray-400 text-xs font-cuerpo mt-0.5">{peliculaModal.genero}</p>
              </div>
              <button
                onClick={cerrarPanel}
                className="text-gray-400 hover:text-white transition-colors shrink-0 text-2xl leading-none"
                aria-label="Cerrar panel de funciones"
              >
                ×
              </button>
            </div>

            {/* Funciones */}
            <div className="flex-1 px-5 py-4">
              <h3 className="font-titulo font-semibold text-gray-700 text-sm mb-4 uppercase tracking-wide">
                Funciones disponibles
              </h3>
              {cargandoFunc ? (
                <div className="flex justify-center py-10">
                  <Spinner texto="Cargando funciones..." />
                </div>
              ) : errorFunc ? (
                <MensajeError
                  className="py-8"
                  mensaje={errorFunc}
                  onReintentar={() => cargarFunciones(peliculaModal)}
                />
              ) : funciones.length === 0 ? (
                <EstadoVacio
                  className="py-8"
                  icono={<Film />}
                  titulo="Sin funciones"
                  descripcion="No hay funciones disponibles para esta película."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {funciones.map((f) => (
                    <div
                      key={f.id}
                      className="tarjeta p-4 flex items-center justify-between gap-3 hover:shadow-boton transition-shadow"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-titulo font-bold text-gray-900 text-sm">
                            {formatearDiaCorto(f.fechaHora)}
                          </span>
                          <Badge variante="info" className="text-[10px]">{f.sala?.nombre}</Badge>
                          <AvisoDisponibilidad disponibles={f.asientosDisponibles} className="text-[10px]" />
                        </div>
                        <span className="text-gray-500 text-xs font-cuerpo">
                          {formatearHora(f.fechaHora)}
                          {" · "}
                          <span className="font-semibold text-primario">{formatearPrecio(f.precio)}</span>
                        </span>
                      </div>
                      <Button tamaño="sm" onClick={() => irAAsientos(f)} disabled={estaAgotada(f)} aria-label={`Seleccionar función del ${formatearFechaCorta(f.fechaHora)}`}>
                        Elegir
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
