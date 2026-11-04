/**
 * EntradaQR.jsx — Muestra la entrada con su código QR.
 *
 * Dos caminos:
 *  - Justo tras el pago: la compra llega por el state de navegación (todas sus entradas).
 *  - Por URL /entrada/:id o desde Mis compras: se pide la entrada a la API y su función.
 */

import { useEffect, useState } from "react"
import { useNavigate, useLocation, useParams, Link } from "react-router-dom"
import { Download, ArrowLeft, ShoppingBag } from "lucide-react"
import { obtenerEntrada } from "@/services/entradasService"
import { obtenerFuncion } from "@/services/funcionesService"
import { mensajeDeError } from "@/services/apiClient"
import QRTicket from "@/components/QRTicket"
import Spinner from "@/components/ui/Spinner"
import Button from "@/components/ui/Button"
import MensajeError from "@/components/ui/MensajeError"

export default function EntradaQR() {
  const { id: idUrl } = useParams()
  const id = Number(idUrl)
  const location = useLocation()
  const navigate = useNavigate()

  const [entradas, setEntradas] = useState([])
  const [funcion,  setFuncion]  = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    const cargar = async () => {
      setCargando(true)
      setError(null)
      try {
        // Camino rápido: venimos del pago con la compra completa
        const compra = location.state?.compra
        if (compra?.entradas?.length && compra.funcionId) {
          const f = await obtenerFuncion(compra.funcionId, { signal: ctrl.signal })
          setFuncion(f)
          setEntradas(compra.entradas)
          return
        }
        // Camino por URL: una entrada por su id
        if (!Number.isInteger(id) || id <= 0) throw new Error("Entrada no encontrada.")
        const entrada = await obtenerEntrada(id, { signal: ctrl.signal })
        const f = await obtenerFuncion(entrada.funcionId, { signal: ctrl.signal })
        setFuncion(f)
        setEntradas([entrada])
      } catch (err) {
        if (err?.name === "AbortError") return
        setError(mensajeDeError(err, "No se encontró la entrada."))
      } finally {
        if (!ctrl.signal.aborted) setCargando(false)
      }
    }
    cargar()
    return () => ctrl.abort()
  }, [id, location.state])

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Cargando entrada..." /></div>

  if (error || !funcion || entradas.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <MensajeError
          mensaje={error ?? "No se encontró la entrada."}
          onReintentar={() => navigate("/mis-compras")}
        />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 flex flex-col gap-6 items-center">
      <div className="w-full flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primario text-sm font-cuerpo transition-colors">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Volver
        </button>
        <Link to="/mis-compras" className="flex items-center gap-2 text-primario text-sm font-cuerpo hover:underline">
          <ShoppingBag className="w-4 h-4" aria-hidden="true" /> Mis Compras
        </Link>
      </div>

      <div className="text-center">
        <h1 className="font-titulo text-2xl font-bold text-gray-900">¡Tu entrada está lista!</h1>
        <p className="text-gray-500 font-cuerpo text-sm mt-1">Muestra el código QR en la taquilla</p>
      </div>

      {/* Área imprimible: solo esto se incluye al Guardar/Imprimir */}
      <div data-imprimible className="flex flex-col gap-4 w-full items-center">
        {entradas.map((entrada) => (
          <QRTicket key={entrada.id} entrada={entrada} funcion={funcion} className="w-full" />
        ))}
      </div>

      <Button
        variante="secundario"
        tamaño="sm"
        className="w-full max-w-xs"
        onClick={() => window.print()}
        data-no-imprimir
      >
        <Download className="w-4 h-4" aria-hidden="true" />
        Guardar / Imprimir entrada
      </Button>
      <p className="text-xs text-gray-400 font-cuerpo text-center -mt-2" data-no-imprimir>
        Se guardará solo la entrada. En el diálogo elige "Guardar como PDF".
      </p>
    </div>
  )
}
