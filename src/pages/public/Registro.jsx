/**
 * Registro.jsx — Registro de nuevo cliente.
 */

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, User, Phone } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/components/ui/Toast"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Logo from "@/components/Logo"

export default function Registro() {
  const { registrar, cargando } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ nombre: "", email: "", password: "", confirmar: "", telefono: "" })
  const [errores, setErrores] = useState({})

  const cambiar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }))
    setErrores((err) => ({ ...err, [campo]: "" }))
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim())   e.nombre    = "El nombre es requerido"
    if (!form.email)           e.email     = "El correo es requerido"
    if (!form.password)        e.password  = "La contraseña es requerida"
    else if (form.password.length < 6) e.password = "Mínimo 6 caracteres"
    if (form.password !== form.confirmar) e.confirmar = "Las contraseñas no coinciden"
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return
    try {
      const usuario = await registrar({
        nombre:   form.nombre.trim(),
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        telefono: form.telefono.trim(),
      })
      toast({ tipo: "exito", titulo: "¡Cuenta creada!", mensaje: `Bienvenido, ${usuario.nombre.split(" ")[0]}` })
      navigate("/cartelera", { replace: true })
    } catch (err) {
      toast({ tipo: "error", titulo: "Error al registrarse", mensaje: err.message })
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-fondo">
      <div className="w-full max-w-sm animacion-entrada">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo tamaño="lg" conFondo />
        </div>

        <div className="bg-white rounded-sivec shadow-tarjeta border border-gray-100 p-7">
          <h2 className="font-titulo font-bold text-xl text-gray-900 mb-1">Crear cuenta</h2>
          <p className="text-sm text-gray-500 font-cuerpo mb-6">Regístrate como cliente</p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              etiqueta="Nombre completo"
              placeholder="Ana García"
              autoComplete="name"
              value={form.nombre}
              onChange={cambiar("nombre")}
              error={errores.nombre}
              icono={<User className="w-4 h-4" />}
            />
            <Input
              etiqueta="Correo electrónico"
              tipo="email"
              placeholder="usuario@ejemplo.com"
              autoComplete="email"
              value={form.email}
              onChange={cambiar("email")}
              error={errores.email}
              icono={<Mail className="w-4 h-4" />}
            />
            <Input
              etiqueta="Teléfono (opcional)"
              tipo="tel"
              placeholder="300-000-0000"
              autoComplete="tel"
              value={form.telefono}
              onChange={cambiar("telefono")}
              icono={<Phone className="w-4 h-4" />}
            />
            <Input
              etiqueta="Contraseña"
              tipo="password"
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              value={form.password}
              onChange={cambiar("password")}
              error={errores.password}
              icono={<Lock className="w-4 h-4" />}
            />
            <Input
              etiqueta="Confirmar contraseña"
              tipo="password"
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              value={form.confirmar}
              onChange={cambiar("confirmar")}
              error={errores.confirmar}
              icono={<Lock className="w-4 h-4" />}
            />

            <Button type="submit" className="w-full mt-1" cargando={cargando}>
              Crear cuenta
            </Button>
          </form>

          <p className="text-center text-sm font-cuerpo text-gray-500 mt-5">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primario font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
