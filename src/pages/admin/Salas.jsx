/**
 * Salas.jsx — CRUD de salas (admin).
 */

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, Building2 } from "lucide-react"
import {
  listarSalas, crearSala, actualizarSala, eliminarSala,
} from "@/services/salasService"
import { useToast } from "@/components/ui/Toast"
import Modal  from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Input  from "@/components/ui/Input"
import Badge  from "@/components/ui/Badge"
import Spinner from "@/components/ui/Spinner"

export default function Salas() {
  const { toast } = useToast()
  const [salas,    setSalas]    = useState([])
  const [cargando, setCargando] = useState(true)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando,     setEditando]     = useState(null)
  const [form,         setForm]         = useState(formVacio())
  const [guardando,    setGuardando]    = useState(false)
  const [confirmar,    setConfirmar]    = useState(null) // sala a eliminar

  function formVacio() {
    return { nombre: "", filas: 6, columnas: 10, tipo: "estandar" }
  }

  const cargar = async () => setSalas(await listarSalas())
  useEffect(() => { cargar().finally(() => setCargando(false)) }, [])

  const abrirCrear = () => { setEditando(null); setForm(formVacio()); setModalAbierto(true) }
  const abrirEditar = (s) => {
    setEditando(s)
    setForm({ nombre: s.nombre, filas: s.filas, columnas: s.columnas, tipo: s.tipo })
    setModalAbierto(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) {
      toast({ tipo: "advertencia", titulo: "El nombre es requerido" })
      return
    }
    setGuardando(true)
    try {
      const datos = {
        nombre: form.nombre.trim(),
        filas: Number(form.filas),
        columnas: Number(form.columnas),
        tipo: form.tipo,
      }
      if (editando) { await actualizarSala(editando.id, datos); toast({ tipo: "exito", titulo: "Sala actualizada" }) }
      else { await crearSala(datos); toast({ tipo: "exito", titulo: "Sala creada" }) }
      await cargar()
      setModalAbierto(false)
    } catch (err) {
      toast({ tipo: "error", titulo: "Error", mensaje: err.message })
    } finally {
      setGuardando(false)
    }
  }

  const confirmarEliminar = async () => {
    try {
      await eliminarSala(confirmar.id)
      toast({ tipo: "exito", titulo: "Sala eliminada" })
      await cargar()
    } catch (err) {
      toast({ tipo: "error", titulo: "Error", mensaje: err.message })
    } finally {
      setConfirmar(null)
    }
  }

  const capacidadPreview = Number(form.filas || 0) * Number(form.columnas || 0)

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Cargando salas..." /></div>

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-titulo text-2xl font-bold text-gray-900">Gestión de Salas</h1>
          <p className="text-gray-500 font-cuerpo text-sm mt-1">{salas.length} salas registradas</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="w-4 h-4" aria-hidden="true" /> Nueva Sala
        </Button>
      </div>

      {/* Grid de salas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {salas.map((s) => (
          <div key={s.id} className="tarjeta p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-primario-suave flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primario" aria-hidden="true" />
              </div>
              <Badge variante={s.tipo === "vip" ? "primario" : "neutro"} className="capitalize">{s.tipo}</Badge>
            </div>
            <div>
              <h3 className="font-titulo font-bold text-gray-900 text-lg">{s.nombre}</h3>
              <p className="text-sm text-gray-500 font-cuerpo">
                {s.filas} filas × {s.columnas} columnas
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-sm font-cuerpo text-gray-500">Capacidad</span>
              <span className="font-titulo font-bold text-primario">{s.capacidad} asientos</span>
            </div>
            <div className="flex gap-2">
              <Button variante="secundario" tamaño="sm" className="flex-1" onClick={() => abrirEditar(s)}>
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Editar
              </Button>
              <Button variante="peligro" tamaño="sm" onClick={() => setConfirmar(s)} aria-label={`Eliminar ${s.nombre}`}>
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal crear/editar */}
      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo={editando ? "Editar Sala" : "Nueva Sala"}>
        <form onSubmit={guardar} className="flex flex-col gap-4">
          <Input etiqueta="Nombre de la sala" placeholder="Sala 3" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input etiqueta="Filas" tipo="number" min="1" max="26" value={form.filas} onChange={(e) => setForm({ ...form, filas: e.target.value })} />
            <Input etiqueta="Columnas" tipo="number" min="1" max="30" value={form.columnas} onChange={(e) => setForm({ ...form, columnas: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-cuerpo font-medium text-gray-700">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="input-sivec">
              <option value="estandar">Estándar</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          {/* Preview de capacidad */}
          <div className="bg-primario-suave rounded-lg px-4 py-2 text-sm font-cuerpo text-primario-oscuro">
            Capacidad calculada: <strong>{capacidadPreview} asientos</strong>
          </div>
          <div className="flex gap-2 justify-end mt-1">
            <Button variante="fantasma" type="button" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" cargando={guardando}>{editando ? "Guardar cambios" : "Crear sala"}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal confirmar eliminación */}
      <Modal abierto={!!confirmar} onCerrar={() => setConfirmar(null)} titulo="Eliminar sala" tamaño="sm">
        <p className="text-sm text-gray-600 font-cuerpo mb-5">
          ¿Seguro que deseas eliminar <strong>{confirmar?.nombre}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variante="fantasma" onClick={() => setConfirmar(null)}>Cancelar</Button>
          <Button variante="peligro" onClick={confirmarEliminar}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
