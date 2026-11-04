/**
 * QRTicket.jsx — Comprobante de entrada con código QR.
 * Usa qrcode.react para generar el QR a partir del código único de la entrada.
 */

import { QRCodeSVG } from "qrcode.react"
import { formatearDiaFechaLarga, formatearHora, formatearFechaHora } from "@/utils/fechas"
import { MapPin, Calendar, Clock, Armchair } from "lucide-react"
import Badge from "@/components/ui/Badge"
import { cn } from "@/utils/cn"

const VARIANTE_ESTADO = {
  activa:  "activa",
  usada:   "usada",
  anulada: "anulada",
}

/**
 * @param {Object} props
 * @param {Object} props.entrada  — objeto entrada (codigo, estado, asiento, fechaUso)
 * @param {Object} props.funcion  — objeto función enriquecido (pelicula, sala, fechaHora, precio)
 * @param {string} [props.className]
 */
export default function QRTicket({ entrada, funcion, className }) {
  if (!entrada || !funcion) return null

  const estaActiva = entrada.estado === "activa"

  return (
    <div
      className={cn(
        "bg-white rounded-sivec shadow-tarjeta border border-gray-100 overflow-hidden max-w-sm w-full",
        !estaActiva && "opacity-75",
        className
      )}
      aria-label={`Entrada ${entrada.codigo}`}
    >
      {/* Cabecera oscura */}
      <div className="bg-noche-oscuro px-5 py-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-primario-claro text-[11px] font-titulo font-semibold uppercase tracking-widest">
            SIVEC CINE
          </p>
          <h3 className="text-white font-titulo font-bold text-lg leading-tight truncate">
            {funcion.pelicula?.titulo ?? "—"}
          </h3>
        </div>
        <Badge variante={VARIANTE_ESTADO[entrada.estado] ?? "neutro"} className="shrink-0 capitalize">
          {entrada.estado}
        </Badge>
      </div>

      {/* Cuerpo con QR + datos */}
      <div className="px-5 py-4 flex flex-col gap-4">
        {/* QR centrado */}
        <div className="flex justify-center">
          <div
            className={cn(
              "p-3 bg-white rounded-xl border-2",
              estaActiva ? "border-primario/30" : "border-gray-200 grayscale"
            )}
          >
            <QRCodeSVG
              value={entrada.codigo}
              size={140}
              level="H"
              includeMargin={false}
              aria-label={`Código QR: ${entrada.codigo}`}
            />
          </div>
        </div>

        {/* Código alfanumérico */}
        <p className="text-center font-titulo font-bold text-gray-800 tracking-widest text-sm">
          {entrada.codigo}
        </p>

        {/* Separador de ticket */}
        <div className="flex items-center gap-2">
          <div className="flex-1 border-t border-dashed border-gray-200" />
          <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200" aria-hidden="true" />
          <div className="flex-1 border-t border-dashed border-gray-200" />
        </div>

        {/* Datos de la función */}
        <div className="flex flex-col gap-2 text-sm font-cuerpo">
          <Fila icono={<Calendar />} label="Fecha">
            {formatearDiaFechaLarga(funcion?.fechaHora)}
          </Fila>
          <Fila icono={<Clock />} label="Hora">
            {formatearHora(funcion?.fechaHora)}
          </Fila>
          <Fila icono={<MapPin />} label="Sala">
            {funcion.sala?.nombre ?? "—"}
          </Fila>
          <Fila icono={<Armchair />} label="Asiento">
            <span className="font-bold text-primario">{entrada.asiento}</span>
          </Fila>
        </div>

        {/* Aviso si ya fue usada */}
        {entrada.estado === "usada" && entrada.fechaUso && (
          <div className="bg-primario-suave rounded-lg px-3 py-2 text-xs text-primario-oscuro font-cuerpo text-center">
            Canjeada el {formatearFechaHora(entrada.fechaUso)}
          </div>
        )}

        {entrada.estado === "anulada" && (
          <div className="bg-red-50 rounded-lg px-3 py-2 text-xs text-red-600 font-cuerpo text-center">
            Entrada anulada — la función fue cancelada
          </div>
        )}
      </div>
    </div>
  )
}

function Fila({ icono, label, children }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-primario mt-0.5 [&>svg]:w-4 [&>svg]:h-4 shrink-0" aria-hidden="true">
        {icono}
      </span>
      <span className="text-gray-500 shrink-0 w-14">{label}</span>
      <span className="text-gray-900 font-medium capitalize">{children}</span>
    </div>
  )
}
