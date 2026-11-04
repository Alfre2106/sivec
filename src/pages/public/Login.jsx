/**
 * Login.jsx — Pantalla de inicio de sesión.
 * Fiel a la imagen de referencia: tarjeta centrada sobre fondo oscuro,
 * acceso rápido por rol (Cliente / Taquilla / Admin).
 */

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/components/ui/Toast"
import { mensajeDeError } from "@/services/apiClient"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Logo from "@/components/Logo"

// Acceso rápido para pruebas
const ACCESOS_RAPIDOS = [
  { rol: "Cliente",    email: "cliente@sivec.com",     icono: "👤" },
  { rol: "Taquilla",  email: "taquillero@sivec.com",   icono: "🎟" },
  { rol: "Admin",     email: "admin@sivec.com",         icono: "⚙️" },
]

export default function Login() {
  const { login, cargando } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const desde = location.state?.desde?.pathname ?? "/"

  const [form, setForm]         = useState({ email: "", password: "" })
  const [errores, setErrores]   = useState({})
  const [verPass, setVerPass]   = useState(false)

  const cambiar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }))
    setErrores((err) => ({ ...err, [campo]: "" }))
  }

  const validar = () => {
    const e = {}
    if (!form.email)    e.email    = "El correo es requerido"
    if (!form.password) e.password = "La contraseña es requerida"
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return
    try {
      const usuario = await login(form.email, form.password)
      toast({ tipo: "exito", titulo: `Bienvenido, ${usuario.nombre.split(" ")[0]}` })
      // Redirigir según rol
      if (usuario.rol === "admin")       navigate("/panel/admin",    { replace: true })
      else if (usuario.rol === "taquillero") navigate("/panel/taquilla", { replace: true })
      else navigate(desde, { replace: true })
    } catch (err) {
      // Mensaje del servidor (credenciales inválidas, cuenta desactivada) o de falla de conexión
      toast({ tipo: "error", titulo: "Error al iniciar sesión", mensaje: mensajeDeError(err, err?.message) })
    }
  }

  const accesoRapido = async (email) => {
    setForm({ email, password: "123456" })
    try {
      const usuario = await login(email, "123456")
      toast({ tipo: "exito", titulo: `Bienvenido, ${usuario.nombre.split(" ")[0]}` })
      if (usuario.rol === "admin")           navigate("/panel/admin",    { replace: true })
      else if (usuario.rol === "taquillero") navigate("/panel/taquilla", { replace: true })
      else navigate(desde, { replace: true })
    } catch (err) {
      toast({ tipo: "error", titulo: "Error", mensaje: mensajeDeError(err, err?.message) })
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-fondo">
      <div className="w-full max-w-sm animacion-entrada">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo tamaño="lg" conFondo />
        </div>

        {/* Tarjeta */}
        <div className="bg-white rounded-sivec shadow-tarjeta border border-gray-100 p-7">
          <h2 className="font-titulo font-bold text-xl text-gray-900 mb-1">Iniciar Sesión</h2>
          <p className="text-sm text-gray-500 font-cuerpo mb-6">Accede a tu cuenta</p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              etiqueta="Correo electrónico"
              tipo="email"
              placeholder="usuario@sivec.com"
              autoComplete="email"
              value={form.email}
              onChange={cambiar("email")}
              error={errores.email}
              icono={<Mail className="w-4 h-4" />}
            />

            <div className="relative">
              <Input
                etiqueta="Contraseña"
                tipo={verPass ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={cambiar("password")}
                error={errores.password}
                icono={<Lock className="w-4 h-4" />}
              />
              <button
                type="button"
                onClick={() => setVerPass((v) => !v)}
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={verPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {verPass
                  ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                  : <Eye    className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>

            <Button type="submit" className="w-full mt-1" cargando={cargando}>
              Ingresar
            </Button>
          </form>

          <p className="text-center text-sm font-cuerpo text-gray-500 mt-5">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="text-primario font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>

          {/* Separador */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" aria-hidden="true" />
            <span className="text-xs text-gray-400 font-cuerpo">o acceso rápido</span>
            <div className="flex-1 h-px bg-gray-200" aria-hidden="true" />
          </div>

          {/* Accesos rápidos por rol */}
          <div className="grid grid-cols-3 gap-2">
            {ACCESOS_RAPIDOS.map(({ rol, email, icono }) => (
              <button
                key={rol}
                type="button"
                onClick={() => accesoRapido(email)}
                disabled={cargando}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200
                           hover:border-primario hover:bg-primario-suave transition-all duration-150
                           text-xs font-cuerpo text-gray-600 hover:text-primario disabled:opacity-50"
                aria-label={`Entrar como ${rol}`}
              >
                <span className="text-xl" aria-hidden="true">{icono}</span>
                <span>{rol}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
