/**
 * Funciones.jsx — CRUD de funciones (admin).
 * Crear, editar, desactivar (finalizar) y cancelar funciones.
 */

import { useEffect, useState } from "react"
import { Plus, Pencil, Ban, CheckCircle2 } from "lucide-react"
import {
  listarTodasFunciones, crearFuncion, actualizarFuncion, cancelarFuncion,
} from "@/services/funcionesService"
import { listarTodasPeliculas } from "@/services/peliculasService"
import { listarSalas } from "@/services/salasService"
import { useToast } from "@/components/ui/Toast"
import Modal  from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Input  from "@/components/ui/Input"
import Badge  from "@/components/ui/Badge"
import Spinner from "@/components/ui/Spinner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatearPrecio } from "@/utils/formato"

const VARIANTE_ESTADO = { activa: "exito", cancelada: "error", finalizada: "neutro" }

export default function Funciones() {
  const { toast } = useToast()
  const [funciones, setFunciones] = useState([])
  const [peliculas, setPeliculas] = useState([])
  const [salas,     setSalas]     = useState([])
  const [cargando,  setCargando]  = useState(true)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando,     setEditando]     = useState(null) // función en edición o null
  const [form,         setForm]         = useState(formVacio())
  const [guardando,    setGuardando]    = useState(false)
  // Confirmación de cambio de estado: { funcion, nuevoEstado } | null
  const [confirmarEstado, setConfirmarEstado] = useState(null)

  function formVacio() {
    return { peliculaId: "", salaId: "", fecha: "", hora: "", precio: 20000 }
  }

  const cargar = async () => {
    const [f, p, s] = await Promise.all([
      listarTodasFunciones(), listarTodasPeliculas(), listarSalas(),
    ])
    setFunciones(f); setPeliculas(p); setSalas(s)
  }

  useEffect(() => { cargar().finally(() => setCargando(false)) }, [])

  // ── Abrir modal ─────────────────────────────────────────────────────────
  const abrirCrear = () => {
    setEditando(null)
    setForm(formVacio())
    setModalAbierto(true)
  }

  const abrirEditar = (f) => {
    const fecha = new Date(f.fechaHora)
    setEditando(f)
    setForm({
      peliculaId: f.peliculaId,
      salaId: f.salaId,
      fecha: format(fecha, "yyyy-MM-dd"),
      hora:  format(fecha, "HH:mm"),
      precio: f.precio ?? 20000,
    })
    setModalAbierto(true)
  }

  // ── Guardar ─────────────────────────────────────────────────────────────
  const guardar = async (e) => {
    e.preventDefault()
    if (!form.peliculaId || !form.salaId || !form.fecha || !form.hora) {
      toast({ tipo: "advertencia", titulo: "Completa todos los campos" })
      return
    }
    setGuardando(true)
    try {
      const fechaHora = new Date(`${form.fecha}T${form.hora}:00`).toISOString()
      const datos = {
        peliculaId: form.peliculaId,
        salaId: form.salaId,
        fechaHora,
        precio: Number(form.precio),
      }
      if (editando) {
        await actualizarFuncion(editando.id, datos)
        toast({ tipo: "exito", titulo: "Función actualizada" })
      } else {
        await crearFuncion(datos)
        toast({ tipo: "exito", titulo: "Función creada" })
      }
      await cargar()
      setModalAbierto(false)
    } catch (err) {
      toast({ tipo: "error", titulo: "Error", mensaje: err.message })
    } finally {
      setGuardando(false)
    }
  }

  // ── Acciones de estado (ejecutadas tras confirmar) ─────────────────────────
  const aplicarCambioEstado = async () => {
    const { funcion: f, nuevoEstado } = confirmarEstado
    try {
      if (nuevoEstado === "cancelada") await cancelarFuncion(f.id)
      else await actualizarFuncion(f.id, { estado: nuevoEstado })
      toast({ tipo: "exito", titulo: `Función ${nuevoEstado}` })
      await cargar()
    } catch (err) {
      toast({ tipo: "error", titulo: "Error", mensaje: err.message })
    } finally {
      setConfirmarEstado(null)
    }
  }

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Cargando funciones..." /></div>

  return (
    <div className="flex flex-col gap-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-titulo text-2xl font-bold text-gray-900">Gestión de Funciones</h1>
          <p className="text-gray-500 font-cuerpo text-sm mt-1">{funciones.length} funciones registradas</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="w-4 h-4" aria-hidden="true" /> Nueva Función
        </Button>
      </div>

      {/* Tabla */}
      <div className="tarjeta overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-cuerpo">
            <thead className="bg-fondo-panel border-b border-gray-200">
              <tr>
                {["Película", "Sala", "Fecha y hora", "Precio", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-600 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {funciones.map((f) => (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-fondo-panel/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {f.pelicula?.poster && (
                        <img src={f.pelicula.poster} alt="" className="w-7 h-10 rounded object-cover object-top shrink-0" aria-hidden="true" />
                      )}
                      <span className="font-semibold text-gray-800">{f.pelicula?.titulo ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{f.sala?.nombre ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {format(new Date(f.fechaHora), "d MMM yyyy · h:mm a", { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatearPrecio(f.precio ?? 0)}</td>
                  <td className="px-4 py-3">
                    <Badge variante={VARIANTE_ESTADO[f.estado] ?? "neutro"} className="capitalize">{f.estado}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => abrirEditar(f)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-primario-suave hover:text-primario transition-colors"
                        aria-label={`Editar función de ${f.pelicula?.titulo}`}
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </button>
                      {f.estado === "activa" ? (
                        <button
                          onClick={() => setConfirmarEstado({ funcion: f, nuevoEstado: "cancelada" })}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-error transition-colors"
                          aria-label={`Cancelar función de ${f.pelicula?.titulo}`}
                          title="Cancelar"
                        >
                          <Ban className="w-4 h-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmarEstado({ funcion: f, nuevoEstado: "activa" })}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-green-50 hover:text-exito transition-colors"
                          aria-label={`Reactivar función de ${f.pelicula?.titulo}`}
                          title="Reactivar"
                        >
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear/editar */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={editando ? "Editar Función" : "Nueva Función"}
      >
        <form onSubmit={guardar} className="flex flex-col gap-4">
          {/* Película */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-cuerpo font-medium text-gray-700">Película</label>
            <select
              value={form.peliculaId}
              onChange={(e) => setForm({ ...form, peliculaId: e.target.value })}
              className="input-sivec"
            >
              <option value="">Selecciona una película</option>
              {peliculas.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
            </select>
          </div>
          {/* Sala */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-cuerpo font-medium text-gray-700">Sala</label>
            <select
              value={form.salaId}
              onChange={(e) => setForm({ ...form, salaId: e.target.value })}
              className="input-sivec"
            >
              <option value="">Selecciona una sala</option>
              {salas.map((s) => <option key={s.id} value={s.id}>{s.nombre} ({s.capacidad} asientos)</option>)}
            </select>
          </div>
          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-3">
            <Input etiqueta="Fecha" tipo="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            <Input etiqueta="Hora"  tipo="time" value={form.hora}  onChange={(e) => setForm({ ...form, hora:  e.target.value })} />
          </div>
          {/* Precio */}
          <Input etiqueta="Precio (COP)" tipo="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />

          <div className="flex gap-2 justify-end mt-2">
            <Button variante="fantasma" type="button" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" cargando={guardando}>{editando ? "Guardar cambios" : "Crear función"}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal confirmar cambio de estado */}
      <Modal
        abierto={!!confirmarEstado}
        onCerrar={() => setConfirmarEstado(null)}
        titulo={confirmarEstado?.nuevoEstado === "cancelada" ? "Cancelar función" : "Reactivar función"}
        tamaño="sm"
      >
        <p className="text-sm text-gray-600 font-cuerpo mb-5">
          {confirmarEstado?.nuevoEstado === "cancelada" ? (
            <>
              ¿Seguro que deseas <strong>cancelar</strong> la función de{" "}
              <strong>{confirmarEstado?.funcion?.pelicula?.titulo}</strong>?
              Las entradas vendidas de esta función quedarán <strong>anuladas</strong>.
            </>
          ) : (
            <>
              ¿Deseas <strong>reactivar</strong> la función de{" "}
              <strong>{confirmarEstado?.funcion?.pelicula?.titulo}</strong>?
            </>
          )}
        </p>
        <div className="flex gap-2 justify-end">
          <Button variante="fantasma" onClick={() => setConfirmarEstado(null)}>Cancelar</Button>
          <Button
            variante={confirmarEstado?.nuevoEstado === "cancelada" ? "peligro" : "primario"}
            onClick={aplicarCambioEstado}
          >
            {confirmarEstado?.nuevoEstado === "cancelada" ? "Sí, cancelar" : "Sí, reactivar"}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
