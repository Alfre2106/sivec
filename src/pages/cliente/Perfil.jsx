/**
 * Perfil.jsx — Página de perfil del usuario autenticado.
 */

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/components/ui/Toast"
import { actualizarPerfil } from "@/services/authService"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Badge from "@/components/ui/Badge"
import { User, Mail, Phone, IdCard, Save } from "lucide-react"

const ROL_VARIANTE = { cliente: "info", taquillero: "advertencia", admin: "primario" }

export default function Perfil() {
  const { usuario, rol } = useAuth()
  const { toast } = useToast()
  const [form, setForm]     = useState({ nombre: usuario?.nombre ?? "", telefono: usuario?.telefono ?? "", documento: usuario?.documento ?? "" })
  const [guardando, setGuardando] = useState(false)

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await actualizarPerfil(usuario.id, form)
      toast({ tipo: "exito", titulo: "Perfil actualizado" })
    } catch (err) {
      toast({ tipo: "error", titulo: "Error", mensaje: err.message })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-titulo text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

      {/* Avatar + info */}
      <div className="tarjeta p-6 flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-degradado-violeta flex items-center justify-center font-titulo font-extrabold text-white text-2xl shrink-0">
          {usuario?.nombre?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-titulo font-bold text-gray-900 text-lg">{usuario?.nombre}</p>
          <p className="text-gray-500 text-sm font-cuerpo">{usuario?.email}</p>
          <Badge variante={ROL_VARIANTE[rol] ?? "neutro"} className="mt-1 capitalize">{rol}</Badge>
        </div>
      </div>

      {/* Formulario de edición */}
      <div className="tarjeta p-6">
        <h2 className="font-titulo font-semibold text-gray-800 mb-5">Editar información</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            etiqueta="Nombre completo"
            value={form.nombre}
            onChange={cambiar("nombre")}
            icono={<User className="w-4 h-4" />}
          />
          <Input
            etiqueta="Correo electrónico"
            value={usuario?.email ?? ""}
            disabled
            icono={<Mail className="w-4 h-4" />}
          />
          <Input
            etiqueta="Teléfono"
            value={form.telefono}
            onChange={cambiar("telefono")}
            icono={<Phone className="w-4 h-4" />}
          />
          <Input
            etiqueta="Documento de identidad"
            value={form.documento}
            onChange={cambiar("documento")}
            icono={<IdCard className="w-4 h-4" />}
          />
          <Button type="submit" cargando={guardando} className="mt-1">
            <Save className="w-4 h-4" aria-hidden="true" />
            Guardar cambios
          </Button>
        </form>
      </div>
    </div>
  )
}
