/**
 * Contacto.jsx — Página de contacto con formulario funcional (simulado).
 * El envío no va a ningún backend todavía: muestra un toast de confirmación.
 */

import { useState } from "react"
import { Mail, Phone, MapPin, Send, MessageSquare, User, Clock } from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

// Datos de contacto (coherentes con el Footer)
const INFO = [
  { icono: <Mail />,  etiqueta: "Correo",    valor: "contacto@sivec.edu.co" },
  { icono: <Phone />, etiqueta: "Teléfono",  valor: "(605) 123-4567" },
  { icono: <MapPin />,etiqueta: "Dirección", valor: "Universidad — Ing. de Sistemas" },
  { icono: <Clock />, etiqueta: "Horario",   valor: "Lun a Dom · 10:00 AM – 10:00 PM" },
]

export default function Contacto() {
  const { toast } = useToast()
  const [form, setForm]       = useState({ nombre: "", email: "", mensaje: "" })
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)

  const cambiar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }))
    setErrores((err) => ({ ...err, [campo]: "" }))
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim())  e.nombre  = "El nombre es requerido"
    if (!form.email.trim())   e.email   = "El correo es requerido"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Correo no válido"
    if (!form.mensaje.trim()) e.mensaje = "Escribe tu mensaje"
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return
    setEnviando(true)
    // Simular envío (en el futuro: POST /api/contacto)
    await new Promise((r) => setTimeout(r, 700))
    setEnviando(false)
    toast({
      tipo: "exito",
      titulo: "¡Mensaje enviado!",
      mensaje: "Gracias por escribirnos. Te responderemos pronto.",
    })
    setForm({ nombre: "", email: "", mensaje: "" })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Encabezado */}
      <div className="text-center mb-10">
        <h1 className="font-titulo text-3xl font-bold text-gray-900">Contacto</h1>
        <p className="text-gray-500 font-cuerpo mt-2 max-w-lg mx-auto">
          ¿Tienes preguntas o sugerencias? Escríbenos y te responderemos lo antes posible.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">

        {/* ── Info de contacto ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="bg-noche-oscuro rounded-sivec p-6 text-white flex flex-col gap-5">
            <h2 className="font-titulo font-bold text-lg">Información de contacto</h2>
            <ul className="flex flex-col gap-4" role="list">
              {INFO.map(({ icono, etiqueta, valor }) => (
                <li key={etiqueta} className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-primario/30 flex items-center justify-center text-primario-claro shrink-0 [&>svg]:w-4 [&>svg]:h-4">
                    {icono}
                  </span>
                  <div>
                    <p className="text-xs text-gray-400 font-cuerpo">{etiqueta}</p>
                    <p className="text-sm font-cuerpo text-white">{valor}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Nota */}
          <div className="tarjeta p-5 flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-primario shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-gray-500 font-cuerpo">
              También puedes acercarte a nuestra taquilla para comprar entradas de forma presencial.
            </p>
          </div>
        </div>

        {/* ── Formulario ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="tarjeta p-6 flex flex-col gap-4">
          <h2 className="font-titulo font-bold text-lg text-gray-900">Envíanos un mensaje</h2>

          <Input
            etiqueta="Nombre"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={cambiar("nombre")}
            error={errores.nombre}
            icono={<User className="w-4 h-4" />}
          />
          <Input
            etiqueta="Correo electrónico"
            tipo="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={cambiar("email")}
            error={errores.email}
            icono={<Mail className="w-4 h-4" />}
          />

          {/* Área de mensaje */}
          <div className="flex flex-col gap-1">
            <label htmlFor="mensaje" className="text-sm font-cuerpo font-medium text-gray-700">
              Mensaje
            </label>
            <textarea
              id="mensaje"
              rows={5}
              placeholder="Escribe tu mensaje aquí..."
              value={form.mensaje}
              onChange={cambiar("mensaje")}
              className="input-sivec resize-none"
              aria-invalid={!!errores.mensaje}
              aria-describedby={errores.mensaje ? "mensaje-error" : undefined}
            />
            {errores.mensaje && (
              <p id="mensaje-error" className="text-xs text-error font-cuerpo" role="alert">
                {errores.mensaje}
              </p>
            )}
          </div>

          <Button type="submit" cargando={enviando} className="w-full mt-1">
            <Send className="w-4 h-4" aria-hidden="true" />
            Enviar mensaje
          </Button>
        </form>
      </div>
    </div>
  )
}
