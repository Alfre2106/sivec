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
import { mensajeDeError } from "@/services/apiClient"
import { useToast }       from "@/components/ui/Toast"
import Button  from "@/components/ui/Button"
import Input   from "@/components/ui/Input"
import Spinner from "@/components/ui/Spinner"
import { formatearDiaFechaLarga, formatearHora, formatearFechaHora } from "@/utils/fechas"
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
  otra_funcion: {
    icono:  <AlertTriangle className="w-20 h-20" aria-hidden="true" />,
    titulo: "⚠️ Otra Función",
    fondo:  "bg-amber-50 border-amber-300",
    texto:  "text-amber-800",
    icColor:"text-amber-500",
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
const esDesarrollo = import.meta.env?.DEV

// Estados internos de html5-qrcode (evitamos importar su enum para no acoplar):
// 1 = NOT_STARTED, 2 = SCANNING, 3 = PAUSED. stop() solo es válido en 2 o 3.
const ESTADOS_DETENIBLES = new Set([2, 3])

/** Mensaje amable según el tipo de fallo de cámara. */
function mensajeDeCamara(err) {
  const nombre = err?.name ?? ""
  if (nombre === "NotAllowedError" || nombre === "SecurityError")
    return "Diste el permiso de cámara como denegado. Habilítalo en el navegador o usa Manual / Adjuntar QR."
  if (nombre === "NotFoundError" || nombre === "OverconstrainedError")
    return "No se encontró ninguna cámara. Usa Manual o Adjuntar QR."
  if (nombre === "NotReadableError")
    return "La cámara está en uso por otra aplicación. Ciérrala e inténtalo, o usa Manual / Adjuntar QR."
  return "No se pudo iniciar la cámara. Usa Manual o Adjuntar QR."
}

/**
 * EscanerQR — monta la cámara de html5-qrcode solo mientras `activo` es true.
 *
 * El ciclo de vida de html5-qrcode es asíncrono y frágil: start()/stop()/clear()
 * devuelven promesas que rechazan si se llaman en el orden o estado equivocados
 * (doble montaje de StrictMode, cambio rápido de pestaña, desmontaje antes de que
 * start() resuelva). Aquí se encapsula para que NINGÚN fallo de limpieza escape al
 * render de React (y por tanto al ErrorBoundary): todo va en try/catch o .catch().
 */
function EscanerQR({ onResultado, activo }) {
  const scannerRef = useRef(null)   // instancia de Html5Qrcode viva
  const startRef   = useRef(null)   // promesa del start() en curso
  const montadoRef = useRef(true)   // false cuando el componente ya se desmontó
  const [error, setError] = useState(null)
  const [iniciando, setIniciando] = useState(false)
  const [intento, setIntento] = useState(0)  // fuerza reintento manual

  useEffect(() => {
    montadoRef.current = true
    if (!activo) return undefined

    // html5-qrcode gestiona un <video> interno; al desmontarlo rápido, el navegador
    // emite "AbortError: play() request was interrupted" como promesa no capturada.
    // Es inofensivo pero ensucia la consola, así que lo silenciamos mientras el escáner vive.
    const ignorarAbortDeMedia = (e) => {
      const motivo = e?.reason
      if (motivo?.name === "AbortError" || /play\(\) request was interrupted/i.test(motivo?.message ?? "")) {
        e.preventDefault()
      }
    }
    window.addEventListener("unhandledrejection", ignorarAbortDeMedia)

    let scanner = null
    setError(null)
    setIniciando(true)

    // Protección contra doble start(): si ya hay instancia, no crear otra.
    try {
      scanner = new Html5Qrcode(SCANNER_ID)
      scannerRef.current = scanner
    } catch (e) {
      if (esDesarrollo) console.warn("No se pudo crear el escáner:", e)
      setIniciando(false)
      setError(mensajeDeCamara(e))
      return undefined
    }

    const alLeer = (texto) => {
      // Detener tras una lectura exitosa, ignorando cualquier rechazo
      detenerSeguro(scanner)
      onResultado(texto)
    }

    const startPromise = scanner
      .start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, alLeer, () => {})
      .then(() => {
        // Si nos desmontaron mientras arrancaba, apagar de inmediato
        if (!montadoRef.current) { detenerSeguro(scanner); return }
        setIniciando(false)
      })
      .catch((e) => {
        if (esDesarrollo) console.warn("start() del escáner falló:", e)
        if (montadoRef.current) { setIniciando(false); setError(mensajeDeCamara(e)) }
      })
    startRef.current = startPromise

    // Limpieza: esperar a que start() termine ANTES de detener/limpiar
    return () => {
      montadoRef.current = false
      const instancia = scanner
      Promise.resolve(startRef.current)
        .then(() => detenerSeguro(instancia))
        .catch(() => {})
        // dar tiempo a que el <video> termine su play() antes de quitar el guard
        .finally(() => setTimeout(() => window.removeEventListener("unhandledrejection", ignorarAbortDeMedia), 1000))
      if (scannerRef.current === scanner) scannerRef.current = null
    }
    // intento fuerza re-ejecución al reintentar
  }, [activo, onResultado, intento])

  const reintentar = () => { setError(null); setIntento((n) => n + 1) }

  return (
    <div className="flex flex-col items-center gap-3">
      {iniciando && activo && !error && (
        <div className="flex items-center gap-2 text-sm text-gray-500 font-cuerpo">
          <Spinner tamaño="sm" />
          Iniciando cámara...
        </div>
      )}

      {error ? (
        <div className="w-full flex flex-col items-center gap-3 py-4 text-center" role="alert">
          <Camera className="w-10 h-10 text-amber-500" aria-hidden="true" />
          <p className="text-sm text-gray-600 font-cuerpo px-4">{error}</p>
          <Button variante="secundario" tamaño="sm" onClick={reintentar}>
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      ) : (
        <>
          {/* Contenedor del escáner — html5-qrcode lo popula con un <video> */}
          <div
            id={SCANNER_ID}
            className="w-full max-w-xs rounded-xl overflow-hidden border-2 border-primario/30 bg-gray-900"
            style={{ minHeight: 280 }}
            aria-label="Visor de cámara para escanear QR"
          />
          <p className="text-xs text-gray-500 font-cuerpo text-center">
            Apunta la cámara al código QR de la entrada
          </p>
        </>
      )}
    </div>
  )
}

/**
 * Detiene y limpia una instancia de html5-qrcode sin que ningún fallo escape.
 * Solo llama a stop() si el escáner está realmente escaneando o en pausa.
 */
function detenerSeguro(scanner) {
  if (!scanner) return
  try {
    const estado = typeof scanner.getState === "function" ? scanner.getState() : null
    const promesaStop = estado === null || ESTADOS_DETENIBLES.has(estado)
      ? Promise.resolve(scanner.stop()).catch(() => {})
      : Promise.resolve()
    promesaStop.finally(() => {
      try { scanner.clear() } catch { /* el contenedor ya pudo desmontarse */ }
    })
  } catch (e) {
    if (esDesarrollo) console.warn("Limpieza del escáner ignorada:", e)
  }
}

// ── Adjuntar imagen de QR ─────────────────────────────────────────────────────
const SCANNER_FILE_ID = "sivec-qr-file"

function AdjuntarQR({ onResultado }) {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState(null)
  const [nombreArchivo, setNombreArchivo] = useState(null)
  const [previa, setPrevia] = useState(null)   // object URL de la imagen elegida

  const manejarArchivo = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""  // permitir volver a subir el mismo archivo
    if (!file) return
    setNombreArchivo(file.name)
    setError(null)
    setProcesando(true)

    // Mostrar la imagen elegida como previsualización
    setPrevia((anterior) => { if (anterior) URL.revokeObjectURL(anterior); return URL.createObjectURL(file) })

    // Cada decodificación usa su propia instancia sobre un contenedor VISIBLE
    // (html5-qrcode no decodifica bien si el contenedor está en display:none).
    let scanner = null
    try {
      scanner = new Html5Qrcode(SCANNER_FILE_ID, { verbose: false })
      // showImage=true: pinta la imagen en el contenedor y decodifica sobre ella
      const texto = await scanner.scanFile(file, true)
      if (texto) { onResultado(texto); return }
      setError("No se detectó ningún código QR en la imagen. Usa una foto más nítida o el modo Manual.")
    } catch (err) {
      if (esDesarrollo) console.warn("scanFile falló:", err)
      setError("No se detectó ningún código QR en la imagen. Recórtala para que el QR ocupe casi todo, o usa el modo Manual.")
    } finally {
      try { await scanner?.clear() } catch { /* contenedor ya limpio */ }
      setProcesando(false)
    }
  }

  // Liberar el object URL al desmontar
  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa) }, [previa])

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Contenedor de trabajo de html5-qrcode: debe estar en el DOM y visible
          (no display:none) para que pueda decodificar. Lo dejamos compacto. */}
      <div
        id={SCANNER_FILE_ID}
        className={cn("w-full max-w-xs rounded-xl overflow-hidden [&_img]:w-full [&_img]:rounded-xl", !previa && "hidden")}
        aria-hidden="true"
      />

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
      {resultado.estado === "ya_usada" && resultado.primerUso?.fecha && (
        <div className={cn("tarjeta px-4 py-3 text-sm font-cuerpo w-full", cfg.texto)}>
          Usada el{" "}
          <strong>{formatearDiaFechaLarga(resultado.primerUso.fecha)}</strong>
          {" a las "}
          <strong>{formatearHora(resultado.primerUso.fecha)}</strong>
          {resultado.primerUso.taquillero && (
            <span className="block text-xs mt-1 opacity-80">Validada por {resultado.primerUso.taquillero}</span>
          )}
        </div>
      )}

      {resultado.funcion && (
        <div className="tarjeta px-4 py-2 w-full text-left text-sm font-cuerpo text-gray-700">
          <p className="font-semibold">{resultado.funcion.pelicula ?? "—"}</p>
          <p className="text-xs text-gray-500">
            {resultado.funcion.inicio ? formatearFechaHora(resultado.funcion.inicio) : "—"}
            {resultado.funcion.sala ? ` · ${resultado.funcion.sala}` : ""}
            {resultado.entrada?.asiento ? <>{" · Asiento: "}<strong className="text-primario">{resultado.entrada.asiento}</strong></> : null}
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
      // Solo un fallo real (red/servidor) llega aquí: los rechazos de negocio vienen con 200
      toast({ tipo: "error", titulo: "Error de validación", mensaje: mensajeDeError(err, "No se pudo validar la entrada.") })
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

          {/* Modo cámara (se desmonta al cambiar de pestaña → la cámara se apaga) */}
          {modo === "camara" && (
            <EscanerQR onResultado={procesar} activo />
          )}

          {/* Modo adjuntar imagen */}
          {modo === "adjuntar" && (
            <AdjuntarQR onResultado={procesar} />
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

      {/* Nota: el código está en la entrada del cliente (QR o texto "SIV-…") */}
      {!resultado && (
        <div className="tarjeta px-5 py-3 flex items-center gap-2 text-xs text-gray-500 font-cuerpo">
          <FlaskConical className="w-4 h-4 text-primario shrink-0" aria-hidden="true" />
          <span>El código aparece bajo el QR de la entrada del cliente (formato <span className="font-mono">SIV-…</span>).</span>
        </div>
      )}
    </div>
  )
}
