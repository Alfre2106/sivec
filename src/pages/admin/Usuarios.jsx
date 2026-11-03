/**
 * Usuarios.jsx — Gestión de usuarios (admin).
 * CRUD completo: listar, crear, editar, cambiar rol, activar/desactivar y eliminar.
 */

import { useEffect, useState } from "react"
import { Plus, Search, UserCheck, UserX, Mail, Pencil, Trash2 } from "lucide-react"
import {
  listarUsuarios, crearUsuario, actualizarUsuario, alternarActivoUsuario, eliminarUsuario,
} from "@/services/authService"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/components/ui/Toast"
import Modal  from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Input  from "@/components/ui/Input"
import Badge  from "@/components/ui/Badge"
import Spinner from "@/components/ui/Spinner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/utils/cn"

const FORM_VACIO = { nombre: "", email: "", password: "123456", rol: "cliente", telefono: "", documento: "" }

export default function Usuarios() {
  const { usuario: usuarioActual } = useAuth()
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [filtroRol, setFiltroRol] = useState("Todos")

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando]         = useState(null)   // usuario en edición o null (crear)
  const [form, setForm]                 = useState(FORM_VACIO)
  const [guardando, setGuardando]       = useState(false)
  const [confirmar, setConfirmar]       = useState(null)    // usuario a eliminar
  const [confirmarRol, setConfirmarRol] = useState(null)    // { usuario, nuevoRol }
  const [confirmarEstado, setConfirmarEstado] = useState(null) // usuario a activar/desactivar

  const cargar = async () => setUsuarios(await listarUsuarios())
  useEffect(() => { cargar().finally(() => setCargando(false)) }, [])

  const filtrados = usuarios.filter((u) => {
    const q = busqueda.toLowerCase()
    const coincide = u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
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
      rol: u.rol ?? "cliente",
      telefono: u.telefono ?? "",
      documento: u.documento ?? "",
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
    setGuardando(true)
    try {
      if (editando) {
        // En edición no enviamos password si quedó vacío
        const datos = {
          nombre: form.nombre.trim(),
          email: form.email.trim().toLowerCase(),
          rol: form.rol,
          telefono: form.telefono,
          documento: form.documento,
        }
        if (form.password.trim()) datos.password = form.password
        await actualizarUsuario(editando.id, datos)
        toast({ tipo: "exito", titulo: "Usuario actualizado" })
      } else {
        await crearUsuario({ ...form, email: form.email.trim().toLowerCase() })
        toast({ tipo: "exito", titulo: "Usuario creado" })
      }
      await cargar()
      setModalAbierto(false)
    } catch (err) {
      toast({ tipo: "error", titulo: "Error", mensaje: err.message })
    } finally {
      setGuardando(false)
    }
  }

  // ── Cambiar rol (tras confirmar) ───────────────────────────────────────────
  const aplicarCambioRol = async () => {
    const { usuario: u, nuevoRol } = confirmarRol
    try {
      await actualizarUsuario(u.id, { rol: nuevoRol })
      toast({ tipo: "exito", titulo: `Rol actualizado a ${nuevoRol}` })
      await cargar()
    } catch (err) {
      toast({ tipo: "error", titulo: "Error", mensaje: err.message })
    } finally {
      setConfirmarRol(null)
    }
  }

  // ── Activar/desactivar (tras confirmar) ────────────────────────────────────
  const aplicarCambioEstado = async () => {
    const u = confirmarEstado
    try {
      await alternarActivoUsuario(u.id)
      toast({ tipo: "exito", titulo: u.activo ? "Usuario desactivado" : "Usuario activado" })
      await cargar()
    } catch (err) {
      toast({ tipo: "error", titulo: "Error", mensaje: err.message })
    } finally {
      setConfirmarEstado(null)
    }
  }

  // ── Eliminar ─────────────────────────────────────────────────────────────
  const confirmarEliminar = async () => {
    try {
      await eliminarUsuario(confirmar.id)
      toast({ tipo: "exito", titulo: "Usuario eliminado" })
      await cargar()
    } catch (err) {
      toast({ tipo: "error", titulo: "Error", mensaje: err.message })
    } finally {
      setConfirmar(null)
    }
  }

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Cargando usuarios..." /></div>

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
                return (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-fondo-panel/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-degradado-violeta flex items-center justify-center font-titulo font-bold text-white text-xs shrink-0">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">
                          {u.nombre}
                          {esMiCuenta && <span className="ml-1 text-[10px] text-primario font-cuerpo">(tú)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.rol}
                        onChange={(e) => setConfirmarRol({ usuario: u, nuevoRol: e.target.value })}
                        disabled={esMiCuenta}
                        className="text-xs font-cuerpo font-semibold rounded-lg border border-gray-200 px-2 py-1 bg-white focus:ring-2 focus:ring-primario outline-none capitalize disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Rol de ${u.nombre}`}
                        title={esMiCuenta ? "No puedes cambiar tu propio rol" : undefined}
                      >
                        <option value="cliente">cliente</option>
                        <option value="taquillero">taquillero</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {u.fechaRegistro ? format(new Date(u.fechaRegistro), "d MMM yyyy", { locale: es }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variante={u.activo ? "exito" : "neutro"}>{u.activo ? "Activo" : "Inactivo"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Editar */}
                        <button
                          onClick={() => abrirEditar(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-primario-suave hover:text-primario transition-colors"
                          aria-label={`Editar a ${u.nombre}`}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                        {/* Activar/desactivar */}
                        <button
                          onClick={() => setConfirmarEstado(u)}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            u.activo ? "text-gray-400 hover:bg-amber-50 hover:text-advertencia" : "text-gray-400 hover:bg-green-50 hover:text-exito"
                          )}
                          aria-label={u.activo ? `Desactivar a ${u.nombre}` : `Activar a ${u.nombre}`}
                          title={u.activo ? "Desactivar" : "Activar"}
                        >
                          {u.activo ? <UserX className="w-4 h-4" aria-hidden="true" /> : <UserCheck className="w-4 h-4" aria-hidden="true" />}
                        </button>
                        {/* Eliminar — no permitido sobre la propia cuenta */}
                        <button
                          onClick={() => setConfirmar(u)}
                          disabled={esMiCuenta}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-error transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          aria-label={`Eliminar a ${u.nombre}`}
                          title={esMiCuenta ? "No puedes eliminar tu propia cuenta" : "Eliminar"}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
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

      {/* Modal crear/editar usuario */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={editando ? "Editar Usuario" : "Nuevo Usuario"}
      >
        <form onSubmit={guardar} className="flex flex-col gap-4">
          <Input etiqueta="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Input etiqueta="Correo electrónico" tipo="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} icono={<Mail className="w-4 h-4" />} />
          <div className="grid grid-cols-2 gap-3">
            <Input etiqueta="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <Input etiqueta="Documento" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-cuerpo font-medium text-gray-700">Rol</label>
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className="input-sivec capitalize">
              <option value="cliente">Cliente</option>
              <option value="taquillero">Taquillero</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
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

      {/* Modal confirmar eliminación */}
      <Modal abierto={!!confirmar} onCerrar={() => setConfirmar(null)} titulo="Eliminar usuario" tamaño="sm">
        <p className="text-sm text-gray-600 font-cuerpo mb-5">
          ¿Seguro que deseas eliminar a <strong>{confirmar?.nombre}</strong> ({confirmar?.email})?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variante="fantasma" onClick={() => setConfirmar(null)}>Cancelar</Button>
          <Button variante="peligro" onClick={confirmarEliminar}>Eliminar</Button>
        </div>
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
          <Button onClick={aplicarCambioRol}>Sí, cambiar rol</Button>
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
          >
            {confirmarEstado?.activo ? "Sí, desactivar" : "Sí, activar"}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
