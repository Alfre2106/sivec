/**
 * VentaTaquilla.jsx — Venta presencial en taquilla.
 *
 * Flujo de 4 pasos:
 *  0 — Función   : lista de funciones activas y futuras
 *  1 — Asientos  : mapa interactivo de la función elegida
 *  2 — Cliente   : nombre y documento (opcionales para taquilla)
 *  3 — Confirmar : resumen + botón "Registrar Venta" + QR de las entradas
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { CheckCircle2, Ticket, RotateCcw, Printer, Banknote, CreditCard } from "lucide-react"

import { listarFunciones }  from "@/services/funcionesService"
import { fueCancelada, mensajeDeError } from "@/services/apiClient"
import { formatearDiaHora, formatearFechaCortaHora, formatearDiaFechaLarga, formatearHora } from "@/utils/fechas"
import { obtenerAsientos, reservarAsientos } from "@/services/asientosService"
import { crearCompra }      from "@/services/comprasService"
import { ApiError }         from "@/services/apiClient"
import { useToast }         from "@/components/ui/Toast"

import PasoIndicador from "@/components/PasoIndicador"
import SeatMap       from "@/components/SeatMap"
import QRTicket      from "@/components/QRTicket"
import Button        from "@/components/ui/Button"
import Input         from "@/components/ui/Input"
import Spinner       from "@/components/ui/Spinner"
import Badge         from "@/components/ui/Badge"
import MensajeError  from "@/components/ui/MensajeError"
import EstadoVacio   from "@/components/ui/EstadoVacio"
import Poster        from "@/components/Poster"
import AvisoDisponibilidad from "@/components/AvisoDisponibilidad"
import { estaAgotada } from "@/utils/disponibilidad"
import { formatearPrecio } from "@/utils/formato"
import { useTaquilla, PASOS } from "@/hooks/useTaquilla"
import { cn } from "@/utils/cn"

// ── Paso 0: Selección de función ─────────────────────────────────────────────
function PasoFuncion({ onSeleccionar }) {
  const [funciones, setFunciones] = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [busqueda,  setBusqueda]  = useState("")
  const [error,     setError]     = useState(null)
  const ctrl = useRef(null)

  const cargar = useCallback(() => {
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    setCargando(true)
    setError(null)
    listarFunciones({ signal: c.signal })
      .then(setFunciones)
      .catch((e) => {
        if (fueCancelada(e)) return
        setError(mensajeDeError(e, "No pudimos cargar las funciones."))
      })
      .finally(() => { if (!c.signal.aborted) setCargando(false) })
  }, [])

  useEffect(() => {
    cargar()
    return () => ctrl.current?.abort()
  }, [cargar])

  const q = busqueda.toLowerCase()
  const filtradas = funciones.filter((f) =>
    (f.pelicula?.titulo ?? "").toLowerCase().includes(q) ||
    (f.sala?.nombre ?? "").toLowerCase().includes(q)
  )

  if (cargando) return <div className="flex justify-center py-12"><Spinner texto="Cargando funciones..." /></div>
  if (error) return <MensajeError className="py-8" mensaje={error} onReintentar={cargar} />

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Buscar por película o sala..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {filtradas.length === 0 ? (
        <EstadoVacio
          className="py-8"
          icono={<Ticket />}
          titulo="Sin funciones"
          descripcion={funciones.length === 0 ? "No hay funciones disponibles." : "Ninguna función coincide con la búsqueda."}
        />
      ) : (
        <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
          {filtradas.map((f) => (
            <button
              key={f.id}
              onClick={() => onSeleccionar(f)}
              disabled={estaAgotada(f)}
              className={cn(
                "w-full tarjeta p-4 text-left flex items-center gap-4",
                "hover:border-primario hover:shadow-boton transition-all duration-150 group",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:shadow-none"
              )}
            >
              <Poster
                src={f.pelicula?.poster}
                alt=""
                className="w-10 h-14 rounded object-cover object-top shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-titulo font-bold text-gray-900 text-sm group-hover:text-primario transition-colors truncate">
                  {f.pelicula?.titulo}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500 font-cuerpo">
                  <span>{formatearDiaHora(f.fechaHora)}</span>
                  <span>·</span>
                  <span>{f.sala?.nombre}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-titulo font-bold text-primario text-sm">{formatearPrecio(f.precio)}</span>
                <AvisoDisponibilidad disponibles={f.asientosDisponibles} className="mt-1 text-[10px]" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Paso 1: Selección de asientos ────────────────────────────────────────────
function PasoAsientos({ funcion, seleccionados, onToggle, refSoltar }) {
  const [asientos, setAsientos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!funcion) return
    const ctrl = new AbortController()
    setCargando(true)
    obtenerAsientos(funcion.id, { signal: ctrl.signal })
      .then(setAsientos)
      .catch(() => {})
      .finally(() => { if (!ctrl.signal.aborted) setCargando(false) })
    return () => ctrl.abort()
  }, [funcion])

  // Permite al padre refrescar el mapa (tras un choque de asientos)
  useEffect(() => {
    if (!refSoltar) return
    refSoltar.current = () => obtenerAsientos(funcion.id).then(setAsientos).catch(() => {})
  }, [refSoltar, funcion])

  if (cargando) return <div className="flex justify-center py-10"><Spinner texto="Cargando sala..." /></div>

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 p-3 bg-fondo-panel rounded-xl">
        <Poster src={funcion.pelicula?.poster} alt="" className="w-10 h-14 rounded object-cover object-top shrink-0" />
        <div className="min-w-0">
          <p className="font-titulo font-bold text-gray-900 text-sm truncate">{funcion.pelicula?.titulo}</p>
          <p className="text-xs text-gray-500 font-cuerpo">
            {formatearFechaCortaHora(funcion.fechaHora)} · {funcion.sala?.nombre}
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

// ── Paso 2: Datos del cliente y método de pago ───────────────────────────────
const METODOS_PAGO = [
  { id: "efectivo", label: "Efectivo", icono: Banknote },
  { id: "tarjeta",  label: "Tarjeta",  icono: CreditCard },
]

function PasoCliente({ cliente, onChange, metodoPago, onMetodo }) {
  return (
    <div className="flex flex-col gap-5 max-w-md">
      <p className="text-sm text-gray-500 font-cuerpo">
        El nombre del cliente es obligatorio para registrar la venta. El documento y el contacto son opcionales.
      </p>
      <Input
        etiqueta="Nombre completo *"
        placeholder="Ana García"
        value={cliente.nombre}
        onChange={(e) => onChange({ ...cliente, nombre: e.target.value })}
        autoComplete="off"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          etiqueta="Documento (opcional)"
          placeholder="123456789"
          value={cliente.documento}
          onChange={(e) => onChange({ ...cliente, documento: e.target.value })}
          autoComplete="off"
        />
        <Input
          etiqueta="Contacto (opcional)"
          placeholder="3001234567"
          value={cliente.contacto}
          onChange={(e) => onChange({ ...cliente, contacto: e.target.value })}
          autoComplete="off"
        />
      </div>

      {/* Método de pago — efectivo por defecto */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-cuerpo font-medium text-gray-700">Método de pago</span>
        <div className="grid grid-cols-2 gap-3">
          {METODOS_PAGO.map(({ id, label, icono: Icono }) => (
            <button
              key={id}
              type="button"
              onClick={() => onMetodo(id)}
              aria-pressed={metodoPago === id}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-boton border-2 font-cuerpo font-semibold text-sm transition-colors",
                metodoPago === id
                  ? "border-primario bg-primario-suave text-primario"
                  : "border-gray-200 text-gray-500 hover:border-primario/40"
              )}
            >
              <Icono className="w-4 h-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Paso 3: Confirmar y registrar venta ──────────────────────────────────────
function PasoConfirmar({ funcion, asientos, cliente, metodoPago, procesando, onConfirmar, compraFinal }) {
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
          <Poster src={funcion.pelicula?.poster} alt="" className="w-10 rounded object-cover object-top shrink-0" />
          <div>
            <p className="font-titulo font-bold text-white text-sm">{funcion.pelicula?.titulo}</p>
            <p className="text-gray-400 text-xs font-cuerpo">
              {formatearDiaFechaLarga(funcion.fechaHora)} · {formatearHora(funcion.fechaHora)} · {funcion.sala?.nombre}
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
          {/* Método de pago */}
          <div className="flex items-center gap-3 text-sm font-cuerpo">
            <span className="text-gray-500 w-24 shrink-0">Pago</span>
            <span className="text-gray-800 font-medium capitalize">{metodoPago}</span>
          </div>
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
  const { toast }   = useToast()
  const {
    paso, avanzar, retroceder, reiniciar,
    funcion,  setFuncion,
    asientos, setAsientos,
    cliente,  setCliente,
    metodoPago, setMetodoPago,
    procesando, setProcesando,
    compraFinal, setCompraFinal,
  } = useTaquilla()
  const refrescarMapa = useRef(null)

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
    if (!cliente.nombre.trim()) {
      toast({ tipo: "advertencia", titulo: "Falta el nombre del cliente" })
      return
    }
    setProcesando(true)
    const asientoIds = asientos.map((a) => a.id)
    try {
      // 1) Reservar los asientos (todo o nada) y 2) venderlos en la misma función.
      await reservarAsientos(funcion.id, asientoIds)
      const { compra } = await crearCompra({
        funcionId:  funcion.id,
        asientoIds,
        metodoPago,
        simularRechazo: false,
        cliente: {
          nombre: cliente.nombre.trim(),
          ...(cliente.documento.trim() ? { documento: cliente.documento.trim() } : {}),
          ...(cliente.contacto.trim() ? { contacto: cliente.contacto.trim() } : {}),
        },
      })
      setCompraFinal(compra)
      toast({ tipo: "exito", titulo: "¡Venta registrada!", mensaje: `${compra.entradas.length} entradas generadas.` })
    } catch (err) {
      await manejarErrorVenta(err)
    } finally {
      setProcesando(false)
    }
  }

  /** Traduce los errores de la venta y refresca el mapa cuando un asiento se perdió. */
  const manejarErrorVenta = async (err) => {
    const codigo = err instanceof ApiError ? err.codigo : null
    if (codigo === "ASIENTO_NO_DISPONIBLE") {
      toast({ tipo: "error", titulo: "Asiento no disponible", mensaje: "Alguien tomó un asiento. Revisa el mapa." })
      await refrescarMapa.current?.()
      setAsientos([])
      return
    }
    if (codigo === "FUNCION_NO_DISPONIBLE") {
      toast({ tipo: "error", titulo: "Función no disponible", mensaje: err.mensaje })
      return
    }
    if (codigo === "CLIENTE_REQUERIDO") {
      toast({ tipo: "advertencia", titulo: "Falta el nombre del cliente", mensaje: err.mensaje })
      return
    }
    toast({ tipo: "error", titulo: "Error al registrar", mensaje: err.mensaje ?? err.message })
  }

  // Validación por paso para el botón "Siguiente"
  const puedeSeguir = () => {
    if (paso === 0) return !!funcion
    if (paso === 1) return asientos.length > 0
    if (paso === 2) return !!cliente.nombre.trim()
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
            refSoltar={refrescarMapa}
          />
        )}
        {paso === 2 && (
          <PasoCliente cliente={cliente} onChange={setCliente} metodoPago={metodoPago} onMetodo={setMetodoPago} />
        )}
        {paso === 3 && funcion && (
          <PasoConfirmar
            funcion={funcion}
            asientos={asientos}
            cliente={cliente}
            metodoPago={metodoPago}
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
