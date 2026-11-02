/**
 * VentaTaquilla.jsx — Venta presencial en taquilla.
 *
 * Flujo de 4 pasos:
 *  0 — Función   : lista de funciones activas y futuras
 *  1 — Asientos  : mapa interactivo de la función elegida
 *  2 — Cliente   : nombre y documento (opcionales para taquilla)
 *  3 — Confirmar : resumen + botón "Registrar Venta" + QR de las entradas
 */

import { useEffect, useState } from "react"
import { CheckCircle2, Ticket, RotateCcw, Printer } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { listarFunciones }  from "@/services/funcionesService"
import { obtenerAsientos }  from "@/services/asientosService"
import { crearCompra }      from "@/services/comprasService"
import { useAuth }          from "@/context/AuthContext"
import { useToast }         from "@/components/ui/Toast"

import PasoIndicador from "@/components/PasoIndicador"
import SeatMap       from "@/components/SeatMap"
import QRTicket      from "@/components/QRTicket"
import Button        from "@/components/ui/Button"
import Input         from "@/components/ui/Input"
import Spinner       from "@/components/ui/Spinner"
import Badge         from "@/components/ui/Badge"
import { formatearPrecio } from "@/utils/formato"
import { useTaquilla, PASOS } from "@/hooks/useTaquilla"
import { cn } from "@/utils/cn"

// ── Paso 0: Selección de función ─────────────────────────────────────────────
function PasoFuncion({ onSeleccionar }) {
  const [funciones, setFunciones] = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [busqueda,  setBusqueda]  = useState("")

  useEffect(() => {
    listarFunciones()
      .then(setFunciones)
      .finally(() => setCargando(false))
  }, [])

  const filtradas = funciones.filter((f) =>
    f.pelicula?.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.sala?.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (cargando) return <div className="flex justify-center py-12"><Spinner texto="Cargando funciones..." /></div>

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Buscar por película o sala..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {filtradas.length === 0 ? (
        <p className="text-center text-gray-400 font-cuerpo py-8">No hay funciones disponibles.</p>
      ) : (
        <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
          {filtradas.map((f) => (
            <button
              key={f.id}
              onClick={() => onSeleccionar(f)}
              className={cn(
                "w-full tarjeta p-4 text-left flex items-center gap-4",
                "hover:border-primario hover:shadow-boton transition-all duration-150 group"
              )}
            >
              <img
                src={f.pelicula?.poster}
                alt=""
                className="w-10 h-14 rounded object-cover object-top shrink-0"
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="font-titulo font-bold text-gray-900 text-sm group-hover:text-primario transition-colors truncate">
                  {f.pelicula?.titulo}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500 font-cuerpo">
                  <span>{format(new Date(f.fechaHora), "EEEE d MMM · h:mm a", { locale: es })}</span>
                  <span>·</span>
                  <span>{f.sala?.nombre}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-titulo font-bold text-primario text-sm">{formatearPrecio(f.precio)}</span>
                <Badge variante="exito" className="block mt-1 text-[10px]">Disponible</Badge>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Paso 1: Selección de asientos ────────────────────────────────────────────
function PasoAsientos({ funcion, seleccionados, onToggle }) {
  const [asientos, setAsientos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!funcion) return
    setCargando(true)
    obtenerAsientos(funcion.id)
      .then(setAsientos)
      .finally(() => setCargando(false))
  }, [funcion])

  if (cargando) return <div className="flex justify-center py-10"><Spinner texto="Cargando sala..." /></div>

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 p-3 bg-fondo-panel rounded-xl">
        <img src={funcion.pelicula?.poster} alt="" className="w-10 h-14 rounded object-cover object-top shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-titulo font-bold text-gray-900 text-sm truncate">{funcion.pelicula?.titulo}</p>
          <p className="text-xs text-gray-500 font-cuerpo">
            {format(new Date(funcion.fechaHora), "d MMM · h:mm a", { locale: es })} · {funcion.sala?.nombre}
          </p>
        </div>
      </div>
      <SeatMap
        asientos={asientos}
        seleccionados={seleccionados.map((a) => a.id)}
        onToggle={onToggle}
      />
      {seleccionados.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {seleccionados.map((a) => (
            <Badge key={a.id} variante="primario" className="text-xs">
              Asiento {a.codigo}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Paso 2: Datos del cliente ─────────────────────────────────────────────────
function PasoCliente({ cliente, onChange }) {
  return (
    <div className="flex flex-col gap-5 max-w-md">
      <p className="text-sm text-gray-500 font-cuerpo">
        Los datos del cliente son opcionales. Puedes completarlos para el registro o dejarlos en blanco.
      </p>
      <Input
        etiqueta="Nombre completo"
        placeholder="Ana García"
        value={cliente.nombre}
        onChange={(e) => onChange({ ...cliente, nombre: e.target.value })}
        autoComplete="off"
      />
      <Input
        etiqueta="Documento de identidad (opcional)"
        placeholder="123456789"
        value={cliente.documento}
        onChange={(e) => onChange({ ...cliente, documento: e.target.value })}
        autoComplete="off"
      />
    </div>
  )
}

// ── Paso 3: Confirmar y registrar venta ──────────────────────────────────────
function PasoConfirmar({ funcion, asientos, cliente, procesando, onConfirmar, compraFinal }) {
  if (compraFinal) {
    // Pantalla de éxito con QR
    return (
      <div className="flex flex-col items-center gap-6 animacion-entrada">
        <div className="flex items-center gap-3 text-exito">
          <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
          <h3 className="font-titulo font-bold text-xl">¡Venta registrada!</h3>
        </div>
        <p className="text-gray-500 font-cuerpo text-sm text-center">
          Se generaron <strong>{compraFinal.entradas.length}</strong> entradas. Entrega los QR al cliente.
        </p>

        {/* Área imprimible: solo los tickets se incluyen al Guardar/Imprimir */}
        <div data-imprimible className="flex flex-wrap gap-4 justify-center w-full">
          {compraFinal.entradas.map((entrada) => (
            <QRTicket key={entrada.id} entrada={entrada} funcion={funcion} />
          ))}
        </div>

        {/* Guardar / imprimir desde taquilla */}
        <Button
          variante="secundario"
          tamaño="sm"
          onClick={() => window.print()}
          data-no-imprimir
        >
          <Printer className="w-4 h-4" aria-hidden="true" />
          Guardar / Imprimir entradas
        </Button>
      </div>
    )
  }

  const total = asientos.length * (funcion.precio ?? 0)

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Resumen */}
      <div className="tarjeta overflow-hidden">
        <div className="bg-noche-oscuro px-4 py-3 flex items-center gap-3">
          <img src={funcion.pelicula?.poster} alt="" className="w-10 rounded object-cover object-top shrink-0" aria-hidden="true" />
          <div>
            <p className="font-titulo font-bold text-white text-sm">{funcion.pelicula?.titulo}</p>
            <p className="text-gray-400 text-xs font-cuerpo">
              {format(new Date(funcion.fechaHora), "d 'de' MMMM yyyy · h:mm a", { locale: es })} · {funcion.sala?.nombre}
            </p>
          </div>
        </div>
        <div className="px-4 py-4 flex flex-col gap-3">
          {/* Asientos */}
          <div className="flex items-start gap-3 text-sm font-cuerpo">
            <span className="text-gray-500 w-24 shrink-0">Asientos</span>
            <div className="flex flex-wrap gap-1.5">
              {asientos.map((a) => (
                <Badge key={a.id} variante="primario">{a.codigo}</Badge>
              ))}
            </div>
          </div>
          {/* Cliente */}
          {(cliente.nombre || cliente.documento) && (
            <div className="flex items-center gap-3 text-sm font-cuerpo">
              <span className="text-gray-500 w-24 shrink-0">Cliente</span>
              <span className="text-gray-800 font-medium">
                {cliente.nombre || "—"}
                {cliente.documento && ` · Doc: ${cliente.documento}`}
              </span>
            </div>
          )}
          {/* Total */}
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <span className="font-titulo font-semibold text-gray-700">Total</span>
            <span className="font-titulo font-extrabold text-primario text-xl">{formatearPrecio(total)}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={onConfirmar}
        cargando={procesando}
        tamaño="lg"
        className="w-full"
      >
        <Ticket className="w-5 h-5" aria-hidden="true" />
        Registrar Venta
      </Button>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function VentaTaquilla() {
  const { usuario } = useAuth()
  const { toast }   = useToast()
  const {
    paso, avanzar, retroceder, reiniciar,
    funcion,  setFuncion,
    asientos, setAsientos,
    cliente,  setCliente,
    procesando, setProcesando,
    compraFinal, setCompraFinal,
  } = useTaquilla()

  // Toggle asiento para el taquillero (sin CartContext — es independiente)
  const toggleAsiento = (asiento) => {
    setAsientos((prev) => {
      const existe = prev.find((a) => a.id === asiento.id)
      return existe ? prev.filter((a) => a.id !== asiento.id) : [...prev, asiento]
    })
  }

  const seleccionarFuncion = (f) => {
    setFuncion(f)
    setAsientos([])
    avanzar()
  }

  const confirmarVenta = async () => {
    if (asientos.length === 0) {
      toast({ tipo: "advertencia", titulo: "Selecciona al menos un asiento" })
      return
    }
    setProcesando(true)
    try {
      const compra = await crearCompra({
        usuarioId:      usuario?.id ?? "taquilla",
        funcionId:      funcion.id,
        asientoIds:     asientos.map((a) => a.id),
        codigosAsiento: asientos.map((a) => a.codigo),
        total:          asientos.length * (funcion.precio ?? 0),
        clienteNombre:  cliente.nombre  || null,
        clienteDocumento: cliente.documento || null,
        simularRechazo: false,
      })
      setCompraFinal(compra)
      toast({ tipo: "exito", titulo: "¡Venta registrada!", mensaje: `${compra.entradas.length} entradas generadas.` })
    } catch (err) {
      toast({ tipo: "error", titulo: "Error al registrar", mensaje: err.message })
    } finally {
      setProcesando(false)
    }
  }

  // Validación por paso para el botón "Siguiente"
  const puedeSeguir = () => {
    if (paso === 0) return !!funcion
    if (paso === 1) return asientos.length > 0
    return true
  }

  const manejarSiguiente = () => {
    if (paso === 3) confirmarVenta()
    else avanzar()
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">

      {/* Stepper */}
      <PasoIndicador pasos={PASOS} actual={paso} />

      {/* Tarjeta del paso actual */}
      <div className="tarjeta p-6">
        <h2 className="font-titulo font-bold text-lg text-gray-900 mb-5">
          {paso === 0 && "Selecciona una función"}
          {paso === 1 && "Selecciona los asientos"}
          {paso === 2 && "Datos del cliente"}
          {paso === 3 && (compraFinal ? "Venta completada" : "Confirmar venta")}
        </h2>

        {/* Contenido dinámico según el paso */}
        {paso === 0 && <PasoFuncion onSeleccionar={seleccionarFuncion} />}
        {paso === 1 && funcion && (
          <PasoAsientos
            funcion={funcion}
            seleccionados={asientos}
            onToggle={toggleAsiento}
          />
        )}
        {paso === 2 && (
          <PasoCliente cliente={cliente} onChange={setCliente} />
        )}
        {paso === 3 && funcion && (
          <PasoConfirmar
            funcion={funcion}
            asientos={asientos}
            cliente={cliente}
            procesando={procesando}
            onConfirmar={confirmarVenta}
            compraFinal={compraFinal}
          />
        )}
      </div>

      {/* Navegación entre pasos */}
      {!compraFinal && (
        <div className="flex items-center justify-between">
          <Button
            variante="fantasma"
            onClick={retroceder}
            disabled={paso === 0}
          >
            ← Anterior
          </Button>

          <span className="text-xs text-gray-400 font-cuerpo">
            Paso {paso + 1} de {PASOS.length}
          </span>

          {/* En el paso de función se avanza automáticamente al seleccionar */}
          {paso !== 0 && paso !== 3 && (
            <Button
              onClick={manejarSiguiente}
              disabled={!puedeSeguir()}
            >
              Siguiente →
            </Button>
          )}
          {paso === 3 && !compraFinal && (
            <Button
              onClick={confirmarVenta}
              cargando={procesando}
              disabled={asientos.length === 0}
            >
              <Ticket className="w-4 h-4" aria-hidden="true" />
              Registrar Venta
            </Button>
          )}
        </div>
      )}

      {/* Botón nueva venta tras éxito */}
      {compraFinal && (
        <Button variante="secundario" onClick={reiniciar} className="self-center">
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Nueva Venta
        </Button>
      )}
    </div>
  )
}
