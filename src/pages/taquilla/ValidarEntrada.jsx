/**
 * ValidarEntrada.jsx — Pantalla de validación de entradas para el taquillero.
 *
 * Modos:
 *  - Escáner QR con la cámara (html5-qrcode)
 *  - Ingreso manual del código
 *
 * Resultados a pantalla grande:
 *  ✅ válida       → fondo verde, "Acceso permitido"
 *  ⚠️ ya_usada    → fondo ámbar, fecha y hora del primer uso
 *  ❌ invalida     → fondo rojo, a qué función pertenece (si aplica)
 *  🚫 anulada      → fondo rojo oscuro, función cancelada
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { CheckCircle2, XCircle, AlertTriangle, Ban, QrCode, Keyboard, RotateCcw, Camera, FlaskConical, ImageUp } from "lucide-react"
import { validarEntrada } from "@/services/entradasService"
import { useToast }       from "@/components/ui/Toast"
import Button  from "@/components/ui/Button"
import Input   from "@/components/ui/Input"
import Spinner from "@/components/ui/Spinner"
import { format } from "date-fns"
import { es }     from "date-fns/locale"
import { cn }     from "@/utils/cn"

// ── Configuración visual por resultado ───────────────────────────────────────
const CONFIG_RESULTADO = {
  valida: {
    icono:  <CheckCircle2 className="w-20 h-20" aria-hidden="true" />,
    titulo: "✅ Acceso Permitido",
    fondo:  "bg-green-50 border-green-300",
    texto:  "text-green-800",
    icColor:"text-green-500",
  },
  ya_usada: {
    icono:  <AlertTriangle className="w-20 h-20" aria-hidden="true" />,
    titulo: "⚠️ Entrada Ya Usada",
    fondo:  "bg-amber-50 border-amber-300",
    texto:  "text-amber-800",
    icColor:"text-amber-500",
  },
  invalida: {
    icono:  <XCircle className="w-20 h-20" aria-hidden="true" />,
    titulo: "❌ Entrada Inválida",
    fondo:  "bg-red-50 border-red-300",
    texto:  "text-red-800",
    icColor:"text-red-500",
  },
  anulada: {
    icono:  <Ban className="w-20 h-20" aria-hidden="true" />,
    titulo: "🚫 Entrada Anulada",
    fondo:  "bg-red-100 border-red-400",
    texto:  "text-red-900",
    icColor:"text-red-600",
  },
}

// ── Escáner de cámara ────────────────────────────────────────────────────────
const SCANNER_ID = "sivec-qr-scanner"

function EscanerQR({ onResultado, activo }) {
  const scannerRef = useRef(null)
  const [error, setError] = useState(null)
  const [iniciando, setIniciando] = useState(true)

  const iniciar = useCallback(async () => {
    if (!activo) return
    setError(null)
    setIniciando(true)
    try {
      const scanner = new Html5Qrcode(SCANNER_ID)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (texto) => {
          onResultado(texto)
          // Detener después de un escaneo exitoso
          scanner.stop().catch(() => {})
        },
        () => {} // Errores de frame — ignorar
      )
    } catch {
      setError("No se pudo acceder a la cámara. Verifica los permisos del navegador.")
    } finally {
      setIniciando(false)
    }
  }, [activo, onResultado])

  const detener = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
      scannerRef.current.clear().catch(() => {})
      scannerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (activo) iniciar()
    return detener
  }, [activo, iniciar, detener])

  return (
    <div className="flex flex-col items-center gap-3">
      {iniciando && activo && (
        <div className="flex items-center gap-2 text-sm text-gray-500 font-cuerpo">
          <Spinner tamaño="sm" />
          Iniciando cámara...
        </div>
      )}
      {error && (
        <p className="text-sm text-error font-cuerpo text-center px-4">{error}</p>
      )}
      {/* Contenedor del escáner — html5-qrcode lo popula con un <video> */}
      <div
        id={SCANNER_ID}
        className="w-full max-w-xs rounded-xl overflow-hidden border-2 border-primario/30 bg-gray-900"
        style={{ minHeight: activo ? 280 : 0 }}
        aria-label="Visor de cámara para escanear QR"
      />
      {!error && (
        <p className="text-xs text-gray-500 font-cuerpo text-center">
          Apunta la cámara al código QR de la entrada
        </p>
      )}
    </div>
  )
}

// ── Adjuntar imagen de QR ─────────────────────────────────────────────────────
const SCANNER_FILE_ID = "sivec-qr-file"

function AdjuntarQR({ onResultado }) {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState(null)
  const [nombreArchivo, setNombreArchivo] = useState(null)

  const manejarArchivo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNombreArchivo(file.name)
    setError(null)
    setProcesando(true)
    try {
      // html5-qrcode puede leer el QR directamente desde una imagen
      const scanner = new Html5Qrcode(SCANNER_FILE_ID)
      const texto = await scanner.scanFile(file, false)
      await scanner.clear().catch(() => {})
      onResultado(texto)
    } catch {
      setError("No se detectó ningún código QR en la imagen. Prueba con otra foto más nítida.")
    } finally {
      setProcesando(false)
      // Permitir volver a subir el mismo archivo
      e.target.value = ""
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Contenedor oculto que html5-qrcode necesita para procesar el archivo */}
      <div id={SCANNER_FILE_ID} className="hidden" aria-hidden="true" />

      <label
        className={cn(
          "w-full max-w-xs flex flex-col items-center justify-center gap-2 py-8 px-4",
          "border-2 border-dashed border-primario/40 rounded-xl cursor-pointer",
          "hover:bg-primario-suave transition-colors text-center",
          procesando && "opacity-60 pointer-events-none"
        )}
      >
        <ImageUp className="w-8 h-8 text-primario" aria-hidden="true" />
        <span className="text-sm font-cuerpo font-semibold text-gray-700">
          {procesando ? "Leyendo imagen..." : "Adjuntar imagen del QR"}
        </span>
        <span className="text-xs text-gray-400 font-cuerpo">
          {nombreArchivo ?? "PNG, JPG o capturas de pantalla"}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={manejarArchivo}
          className="hidden"
          aria-label="Seleccionar imagen de código QR"
        />
      </label>

      {procesando && <Spinner tamaño="sm" texto="Analizando QR..." />}
      {error && (
        <p className="text-sm text-error font-cuerpo text-center px-4" role="alert">{error}</p>
      )}
    </div>
  )
}

// ── Resultado de validación ──────────────────────────────────────────────────
function PantallaResultado({ resultado, onNuevo }) {
  const cfg = CONFIG_RESULTADO[resultado.estado] ?? CONFIG_RESULTADO.invalida

  return (
    <div
      className={cn(
        "rounded-sivec border-2 p-8 flex flex-col items-center gap-4 text-center animacion-entrada",
        cfg.fondo
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className={cn(cfg.icColor)}>{cfg.icono}</div>

      <h2 className={cn("font-titulo font-extrabold text-2xl", cfg.texto)}>
        {cfg.titulo}
      </h2>

      <p className={cn("font-cuerpo text-sm", cfg.texto)}>{resultado.mensaje}</p>

      {/* Detalles extra según estado */}
      {resultado.estado === "ya_usada" && resultado.entrada?.fechaUso && (
        <div className={cn("tarjeta px-4 py-2 text-sm font-cuerpo w-full", cfg.texto)}>
          Usada el{" "}
          <strong>
            {format(new Date(resultado.entrada.fechaUso), "d 'de' MMMM yyyy 'a las' h:mm a", { locale: es })}
          </strong>
        </div>
      )}

      {resultado.funcion && (
        <div className="tarjeta px-4 py-2 w-full text-left text-sm font-cuerpo text-gray-700">
          <p className="font-semibold">{resultado.funcion.pelicula?.titulo}</p>
          <p className="text-xs text-gray-500">
            {format(new Date(resultado.funcion.fechaHora), "d MMM yyyy · h:mm a", { locale: es })}
            {" · "}{resultado.funcion.sala?.nombre}
            {" · Asiento: "}<strong className="text-primario">{resultado.entrada?.asiento}</strong>
          </p>
        </div>
      )}

      <Button onClick={onNuevo} variante="secundario" className="mt-2">
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
        Validar otra entrada
      </Button>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ValidarEntrada() {
  const { toast } = useToast()

  const [modo,        setModo]        = useState("manual")  // "camara" | "manual"
  const [codigo,      setCodigo]      = useState("")
  const [validando,   setValidando]   = useState(false)
  const [resultado,   setResultado]   = useState(null)

  const procesar = useCallback(async (codigoRaw) => {
    const codigoLimpio = codigoRaw.trim().toUpperCase()
    if (!codigoLimpio) return
    setValidando(true)
    setResultado(null)
    try {
      const res = await validarEntrada(codigoLimpio)
      setResultado(res)
    } catch (err) {
      toast({ tipo: "error", titulo: "Error de validación", mensaje: err.message })
    } finally {
      setValidando(false)
    }
  }, [toast])

  const manejarManual = (e) => {
    e.preventDefault()
    procesar(codigo)
  }

  const reiniciar = () => {
    setResultado(null)
    setCodigo("")
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">

      <div>
        <h1 className="font-titulo text-2xl font-bold text-gray-900">Validar Entrada</h1>
        <p className="text-gray-500 font-cuerpo text-sm mt-1">
          Escanea el QR o ingresa el código manualmente
        </p>
      </div>

      {/* Resultado a pantalla grande */}
      {resultado && (
        <PantallaResultado resultado={resultado} onNuevo={reiniciar} />
      )}

      {/* Panel de validación (se oculta cuando hay resultado) */}
      {!resultado && (
        <div className="tarjeta p-6 flex flex-col gap-5">

          {/* Tabs modo */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs sm:text-sm">
            {[
              { id: "camara",  icono: <Camera className="w-4 h-4" />,   label: "Cámara"  },
              { id: "manual",  icono: <Keyboard className="w-4 h-4" />, label: "Manual"  },
              { id: "adjuntar",icono: <ImageUp className="w-4 h-4" />,  label: "Adjuntar QR" },
            ].map(({ id, icono, label }) => (
              <button
                key={id}
                onClick={() => setModo(id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 font-cuerpo font-medium transition-colors whitespace-nowrap",
                  modo === id
                    ? "bg-primario text-white"
                    : "text-gray-500 hover:bg-gray-50"
                )}
                aria-pressed={modo === id}
              >
                {icono}
                {label}
              </button>
            ))}
          </div>

          {/* Modo cámara */}
          {modo === "camara" && (
            <EscanerQR
              onResultado={(txt) => procesar(txt)}
              activo={modo === "camara" && !resultado}
            />
          )}

          {/* Modo adjuntar imagen */}
          {modo === "adjuntar" && (
            <AdjuntarQR onResultado={(txt) => procesar(txt)} />
          )}

          {/* Modo manual */}
          {modo === "manual" && (
            <form onSubmit={manejarManual} className="flex flex-col gap-3">
              <Input
                etiqueta="Código de entrada"
                placeholder="SVC-2026-000001"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                autoComplete="off"
                autoFocus
                icono={<QrCode className="w-4 h-4" />}
              />
              <Button
                type="submit"
                cargando={validando}
                disabled={!codigo.trim()}
                className="w-full"
              >
                {validando ? "Validando..." : "Validar Entrada"}
              </Button>
            </form>
          )}

          {validando && modo === "manual" && (
            <div className="flex justify-center">
              <Spinner tamaño="md" texto="Consultando sistema..." />
            </div>
          )}
        </div>
      )}

      {/* Códigos de prueba — bloque colapsable discreto, separado de la herramienta */}
      {!resultado && (
        <details className="tarjeta overflow-hidden group">
          <summary className="flex items-center gap-2 px-5 py-3 cursor-pointer text-sm font-cuerpo text-gray-500 hover:bg-fondo-panel transition-colors list-none">
            <FlaskConical className="w-4 h-4 text-primario shrink-0" aria-hidden="true" />
            <span className="font-semibold">Códigos de prueba</span>
            <span className="text-xs text-gray-400">(solo para la demostración)</span>
            <span className="ml-auto text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">▾</span>
          </summary>
          <div className="px-5 pb-4 pt-1 flex flex-col gap-1.5 border-t border-gray-100">
            {[
              { codigo: "SVC-2026-000001", desc: "Activa — debe marcar como usada", tono: "exito"       },
              { codigo: "SVC-2026-000002", desc: "Ya usada — muestra fecha de uso",  tono: "advertencia" },
              { codigo: "SVC-2026-000003", desc: "Anulada — función cancelada",      tono: "error"       },
              { codigo: "SVC-2026-FALSO",  desc: "Inválida — no existe",             tono: "neutro"      },
            ].map(({ codigo: c, desc }) => (
              <button
                key={c}
                onClick={() => { setCodigo(c); setModo("manual") }}
                className="flex items-center gap-3 text-left px-3 py-2 rounded-lg hover:bg-primario-suave transition-colors group/btn"
              >
                <span className="font-mono text-xs font-bold text-primario bg-primario-suave px-2 py-0.5 rounded shrink-0 group-hover/btn:bg-primario group-hover/btn:text-white transition-colors">
                  {c}
                </span>
                <span className="text-xs text-gray-500 font-cuerpo">{desc}</span>
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
