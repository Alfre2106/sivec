/**
 * Usuarios.jsx — Gestión de usuarios (admin).
 *
 * Listar, crear (solo taquillero o administrador), editar, cambiar rol y
 * activar/desactivar. No hay borrado permanente: "Desactivar" deja al usuario sin
 * acceso (DELETE en la API = activo:false) y se puede reactivar.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { Plus, Search, UserCheck, UserX, Mail, Pencil } from "lucide-react"
import {
  listarUsuarios, crearUsuario, actualizarUsuario, desactivarUsuario, activarUsuario,
} from "@/services/usuariosService"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/components/ui/Toast"
import { fueCancelada, mensajeDeError } from "@/services/apiClient"
import Modal  from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Input  from "@/components/ui/Input"
import Badge  from "@/components/ui/Badge"
import Spinner from "@/components/ui/Spinner"
import MensajeError from "@/components/ui/MensajeError"
import EstadoVacio from "@/components/ui/EstadoVacio"
import { formatearFechaMedia } from "@/utils/fechas"
import { cn } from "@/utils/cn"

// Al crear solo se permiten taquillero y administrador (los clientes se registran solos).
const FORM_VACIO = { nombre: "", email: "", password: "123456", rol: "taquillero" }
const ROLES_CREABLES = [
  { valor: "taquillero", etiqueta: "Taquillero" },
  { valor: "admin",      etiqueta: "Administrador" },
]

export default function Usuarios() {
  const { usuario: usuarioActual } = useAuth()
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)
  const [busqueda, setBusqueda] = useState("")
  const [filtroRol, setFiltroRol] = useState("Todos")

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando]         = useState(null)   // usuario en edición o null (crear)
  const [form, setForm]                 = useState(FORM_VACIO)
  const [guardando, setGuardando]       = useState(false)
  const [confirmarRol, setConfirmarRol] = useState(null)    // { usuario, nuevoRol }
  const [confirmarEstado, setConfirmarEstado] = useState(null) // usuario a activar/desactivar
  const [procesando, setProcesando]     = useState(false)
  const ctrl = useRef(null)

  const cargar = useCallback(() => {
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    setCargando(true)
    setError(null)
    listarUsuarios({ signal: c.signal })
      .then((data) => { if (!c.signal.aborted) setUsuarios(data) })
      .catch((e) => { if (!fueCancelada(e)) setError(mensajeDeError(e, "No pudimos cargar los usuarios.")) })
      .finally(() => { if (!c.signal.aborted) setCargando(false) })
  }, [])

  useEffect(() => {
    cargar()
    return () => ctrl.current?.abort()
  }, [cargar])

  const filtrados = usuarios.filter((u) => {
    const q = busqueda.toLowerCase()
    const coincide = (u.nombre ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)
    const rolOk = filtroRol === "Todos" || u.rol === filtroRol
    return coincide && rolOk
  })

  // ── Abrir modal ─────────────────────────────────────────────────────────
  const abrirCrear = () => {
    setEditando(null)
    setForm(FORM_VACIO)
    setModalAbierto(true)
  }
  const abrirEditar = (u) => {
    setEditando(u)
    setForm({
      nombre: u.nombre ?? "",
      email: u.email ?? "",
      password: "",            // vacío = no cambiar
      rol: u.rol === "cliente" ? "cliente" : u.rol, // a un cliente no se le cambia el rol aquí
    })
    setModalAbierto(true)
  }

  // ── Guardar (crear o editar) ──────────────────────────────────────────────
  const guardar = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.email.trim()) {
      toast({ tipo: "advertencia", titulo: "Nombre y correo son requeridos" })
      return
    }
    if (!editando && !form.password.trim()) {
      toast({ tipo: "advertencia", titulo: "La contraseña es requerida" })
      return
    }
    setGuardando(true)
    try {
      if (editando) {
        const datos = { nombre: form.nombre.trim(), email: form.email.trim().toLowerCase() }
        // El rol solo se envía si es creable (no se degrada/ eleva a cliente desde aquí)
        if (form.rol !== "cliente") datos.rol = form.rol
        if (form.password.trim()) datos.password = form.password
        await actualizarUsuario(editando.id, datos)
        toast({ tipo: "exito", titulo: "Usuario actualizado" })
      } else {
        await crearUsuario({
          nombre: form.nombre.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          rol: form.rol,
        })
        toast({ tipo: "exito", titulo: "Usuario creado" })
      }
      cargar()
      setModalAbierto(false)
    } catch (err) {
      toast({ tipo: "error", titulo: "Error", mensaje: mensajeDeError(err, err.message) })
    } finally {
      setGuardando(false)
    }
  }

  // ── Cambiar rol (tras confirmar) ───────────────────────────────────────────
  const aplicarCambioRol = async () => {
    const { usuario: u, nuevoRol } = confirmarRol
    setProcesando(true)
    try {
      await actualizarUsuario(u.id, { rol: nuevoRol })
      toast({ tipo: "exito", titulo: `Rol actualizado a ${nuevoRol}` })
      cargar()
    } catch (err) {
      toast({ tipo: "error", titulo: "Error", mensaje: mensajeDeError(err, err.message) })
    } finally {
      setProcesando(false)
      setConfirmarRol(null)
    }
  }

  // ── Activar/desactivar (tras confirmar) ────────────────────────────────────
  const aplicarCambioEstado = async () => {
    const u = confirmarEstado
    setProcesando(true)
    try {
      if (u.activo) await desactivarUsuario(u.id)
      else await activarUsuario(u.id)
      toast({ tipo: "exito", titulo: u.activo ? "Usuario desactivado" : "Usuario activado" })
      cargar()
    } catch (err) {
      toast({ tipo: "error", titulo: "Error", mensaje: mensajeDeError(err, err.message) })
    } finally {
      setProcesando(false)
      setConfirmarEstado(null)
    }
  }

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Cargando usuarios..." /></div>
  if (error) return <MensajeError mensaje={error} onReintentar={cargar} />

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-titulo text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 font-cuerpo text-sm mt-1">{usuarios.length} usuarios registrados</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="w-4 h-4" aria-hidden="true" /> Nuevo Usuario
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Buscar por nombre o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} icono={<Search className="w-4 h-4" />} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Todos", "cliente", "taquillero", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setFiltroRol(r)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-cuerpo font-semibold capitalize whitespace-nowrap transition-colors",
                filtroRol === r ? "bg-primario text-white" : "bg-gray-100 text-gray-600 hover:bg-primario-suave hover:text-primario"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {filtrados.length === 0 ? (
        <EstadoVacio icono={<UserCheck />} titulo="Sin usuarios" descripcion="No hay usuarios que coincidan con el filtro." />
      ) : (
      <div className="tarjeta overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-cuerpo">
            <thead className="bg-fondo-panel border-b border-gray-200">
              <tr>
                {["Usuario", "Correo", "Rol", "Registro", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-600 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => {
                const esMiCuenta = u.id === usuarioActual?.id
                const esCliente = u.rol === "cliente"
                return (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-fondo-panel/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-800">{u.nombre}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      {/* El rol se cambia solo entre taquillero y admin; a un cliente no se le toca aquí */}
                      {esCliente ? (
                        <Badge variante="neutro" className="capitalize">cliente</Badge>
                      ) : (
                        <select
                          value={u.rol}
                          onChange={(e) => setConfirmarRol({ usuario: u, nuevoRol: e.target.value })}
                          disabled={esMiCuenta}
                          className="text-xs font-cuerpo font-semibold rounded-lg border border-gray-200 px-2 py-1 bg-white focus:ring-2 focus:ring-primario outline-none capitalize disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Rol de ${u.nombre}`}
                          title={esMiCuenta ? "No puedes cambiar tu propio rol" : undefined}
                        >
                          <option value="taquillero">taquillero</option>
                          <option value="admin">admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {u.fechaRegistro ? formatearFechaMedia(u.fechaRegistro) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variante={u.activo ? "exito" : "neutro"}>{u.activo ? "Activo" : "Inactivo"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Editar (solo taquilleros/admins; los clientes no se editan aquí) */}
                        {!esCliente && (
                          <button
                            onClick={() => abrirEditar(u)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-primario-suave hover:text-primario transition-colors"
                            aria-label={`Editar a ${u.nombre}`}
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                        {/* Activar/desactivar — no sobre la propia cuenta */}
                        <button
                          onClick={() => setConfirmarEstado(u)}
                          disabled={esMiCuenta}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                            u.activo ? "text-gray-400 hover:bg-amber-50 hover:text-advertencia" : "text-gray-400 hover:bg-green-50 hover:text-exito"
                          )}
                          aria-label={u.activo ? `Desactivar a ${u.nombre}` : `Activar a ${u.nombre}`}
                          title={esMiCuenta ? "No puedes desactivar tu propia cuenta" : (u.activo ? "Desactivar" : "Activar")}
                        >
                          {u.activo ? <UserX className="w-4 h-4" aria-hidden="true" /> : <UserCheck className="w-4 h-4" aria-hidden="true" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal crear/editar usuario */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={editando ? "Editar Usuario" : "Nuevo Usuario"}
      >
        <form onSubmit={guardar} className="flex flex-col gap-4">
          <Input etiqueta="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Input etiqueta="Correo electrónico" tipo="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} icono={<Mail className="w-4 h-4" />} />
          {/* El rol solo se elige para taquilleros/admins; a un cliente editado no se le cambia */}
          {form.rol !== "cliente" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-cuerpo font-medium text-gray-700">Rol</label>
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className="input-sivec capitalize">
                {ROLES_CREABLES.map((r) => <option key={r.valor} value={r.valor}>{r.etiqueta}</option>)}
              </select>
            </div>
          )}
          <Input
            etiqueta={editando ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña inicial"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={editando ? "••••••" : ""}
          />
          <div className="flex gap-2 justify-end mt-1">
            <Button variante="fantasma" type="button" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" cargando={guardando}>{editando ? "Guardar cambios" : "Crear usuario"}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal confirmar cambio de rol */}
      <Modal abierto={!!confirmarRol} onCerrar={() => setConfirmarRol(null)} titulo="Cambiar rol" tamaño="sm">
        <p className="text-sm text-gray-600 font-cuerpo mb-5">
          ¿Cambiar el rol de <strong>{confirmarRol?.usuario?.nombre}</strong> de{" "}
          <strong className="capitalize">{confirmarRol?.usuario?.rol}</strong> a{" "}
          <strong className="capitalize">{confirmarRol?.nuevoRol}</strong>?
          Esto cambia los permisos de acceso del usuario.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variante="fantasma" onClick={() => setConfirmarRol(null)}>Cancelar</Button>
          <Button onClick={aplicarCambioRol} cargando={procesando}>Sí, cambiar rol</Button>
        </div>
      </Modal>

      {/* Modal confirmar activar/desactivar */}
      <Modal abierto={!!confirmarEstado} onCerrar={() => setConfirmarEstado(null)} titulo={confirmarEstado?.activo ? "Desactivar usuario" : "Activar usuario"} tamaño="sm">
        <p className="text-sm text-gray-600 font-cuerpo mb-5">
          {confirmarEstado?.activo ? (
            <>¿Desactivar a <strong>{confirmarEstado?.nombre}</strong>? No podrá iniciar sesión hasta reactivarlo.</>
          ) : (
            <>¿Activar a <strong>{confirmarEstado?.nombre}</strong>? Podrá volver a iniciar sesión.</>
          )}
        </p>
        <div className="flex gap-2 justify-end">
          <Button variante="fantasma" onClick={() => setConfirmarEstado(null)}>Cancelar</Button>
          <Button
            variante={confirmarEstado?.activo ? "peligro" : "primario"}
            onClick={aplicarCambioEstado}
            cargando={procesando}
          >
            {confirmarEstado?.activo ? "Sí, desactivar" : "Sí, activar"}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
