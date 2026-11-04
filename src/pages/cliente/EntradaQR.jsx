/**
 * EntradaQR.jsx — Muestra la entrada con código QR después de la compra.
 * Accesible desde /entrada/:id o desde Mis Compras.
 */

import { useEffect, useState } from "react"
import { useNavigate, useLocation, useParams, Link } from "react-router-dom"
import { Download, ArrowLeft, ShoppingBag } from "lucide-react"
import { listarCompras } from "@/services/comprasService"
import { obtenerFuncion } from "@/services/funcionesService"
import QRTicket from "@/components/QRTicket"
import Spinner from "@/components/ui/Spinner"
import Button from "@/components/ui/Button"
import { mismoId } from "@/utils/ids"

export default function EntradaQR() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [entradas, setEntradas] = useState([])
  const [funcion,  setFuncion]  = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        // La compra puede venir por estado de navegación (justo después del pago)
        // o hay que buscarla por el id de entrada
        let compra = location.state?.compra
        if (!compra) {
          const todas = await listarCompras()
          compra = todas.find((c) => c.entradas?.some((e) => mismoId(e.id, id)))
        }
        if (!compra) throw new Error("Entrada no encontrada")
        const f = await obtenerFuncion(compra.funcionId)
        setFuncion(f)
        setEntradas(compra.entradas ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id, location.state])

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Cargando entrada..." /></div>

  if (!funcion || entradas.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 font-cuerpo mb-4">No se encontró la entrada.</p>
        <Link to="/mis-compras" className="text-primario font-semibold hover:underline">
          Ver Mis Compras
        </Link>
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
