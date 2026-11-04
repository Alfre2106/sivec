/**
 * Funciones.jsx — Gestión de funciones (admin).
 *
 * Crear, editar y cancelar. Cancelar pide un motivo y muestra las compras afectadas
 * (con el total a reembolsar) que devuelve la API. No hay "reactivar": una función
 * cancelada no vuelve a activa.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { Plus, Pencil, Ban, AlertTriangle } from "lucide-react"
import {
  listarTodasFunciones, crearFuncion, actualizarFuncion, cancelarFuncion,
} from "@/services/funcionesAdminService"
import { listarTodasPeliculas } from "@/services/peliculasAdminService"
import { listarSalas } from "@/services/salasService"
import { useToast } from "@/components/ui/Toast"
import { fueCancelada, mensajeDeError } from "@/services/apiClient"
import Modal  from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Input  from "@/components/ui/Input"
import Badge  from "@/components/ui/Badge"
import Poster from "@/components/Poster"
import Spinner from "@/components/ui/Spinner"
import MensajeError from "@/components/ui/MensajeError"
import { formatearDiaHora } from "@/utils/fechas"
import { formatearPrecio } from "@/utils/formato"

const VARIANTE_ESTADO = { activa: "exito", cancelada: "error", finalizada: "neutro" }

export default function Funciones() {
  const { toast } = useToast()
  const [funciones, setFunciones] = useState([])
  const [peliculas, setPeliculas] = useState([])
  const [salas,     setSalas]     = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando,     setEditando]     = useState(null) // función en edición o null
  const [form,         setForm]         = useState(formVacio())
  const [guardando,    setGuardando]    = useState(false)
  // Cancelación: { funcion, motivo, afectadas, totalReembolsar, hecha } | null
  const [cancelacion,  setCancelacion]  = useState(null)
  const [cancelando,   setCancelando]   = useState(false)
  const ctrl = useRef(null)

  function formVacio() {
    return { peliculaId: "", salaId: "", fecha: "", hora: "", precio: 20000 }
  }

  const cargar = useCallback(() => {
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    setCargando(true)
    setError(null)
    Promise.all([
      listarTodasFunciones({ signal: c.signal }),
      listarTodasPeliculas({ signal: c.signal }),
      listarSalas({ signal: c.signal }),
    ])
      .then(([f, p, s]) => { if (!c.signal.aborted) { setFunciones(f); setPeliculas(p); setSalas(s) } })
      .catch((e) => { if (!fueCancelada(e)) setError(mensajeDeError(e, "No pudimos cargar las funciones.")) })
      .finally(() => { if (!c.signal.aborted) setCargando(false) })
  }, [])

  useEffect(() => {
    cargar()
    return () => ctrl.current?.abort()
  }, [cargar])

  // ── Abrir modal ─────────────────────────────────────────────────────────
  const abrirCrear = () => {
    setEditando(null)
    setForm(formVacio())
    setModalAbierto(true)
  }

  const abrirEditar = (f) => {
    // La fecha/hora para los inputs se arma en hora local del navegador a partir del ISO
    const d = new Date(f.fechaHora)
    const pad = (n) => String(n).padStart(2, "0")
    setEditando(f)
    setForm({
      peliculaId: String(f.peliculaId ?? ""),
      salaId: String(f.salaId ?? ""),
      fecha: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      hora:  `${pad(d.getHours())}:${pad(d.getMinutes())}`,
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
      // La hora elegida es local; se envía como ISO con la zona del navegador
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
      cargar()
      setModalAbierto(false)
    } catch (err) {
      toast({ tipo: "error", titulo: "No se pudo guardar", mensaje: mensajeDeError(err, err.message) })
    } finally {
      setGuardando(false)
    }
  }

  // ── Cancelar función con motivo ────────────────────────────────────────────
  const abrirCancelar = (f) => setCancelacion({ funcion: f, motivo: "", afectadas: null, totalReembolsar: 0, hecha: false })

  const confirmarCancelar = async () => {
    if (!cancelacion.motivo.trim()) {
      toast({ tipo: "advertencia", titulo: "Indica el motivo de la cancelación" })
      return
    }
    setCancelando(true)
    try {
      const r = await cancelarFuncion(cancelacion.funcion.id, cancelacion.motivo.trim())
      // Mostramos el resultado (compras afectadas + total) en el mismo modal
      setCancelacion((c) => ({ ...c, afectadas: r.comprasAfectadas, totalReembolsar: r.totalReembolsar, entradasAnuladas: r.entradasAnuladas, hecha: true }))
      toast({ tipo: "exito", titulo: "Función cancelada", mensaje: `${r.entradasAnuladas} entradas anuladas.` })
      cargar()
    } catch (err) {
      toast({ tipo: "error", titulo: "No se pudo cancelar", mensaje: mensajeDeError(err, err.message) })
    } finally {
      setCancelando(false)
    }
  }

  if (cargando) return <div className="flex justify-center py-20"><Spinner tamaño="lg" texto="Cargando funciones..." /></div>
  if (error) return <MensajeError mensaje={error} onReintentar={cargar} />

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
              {funciones.map((f) => {
                const editable = f.estado === "activa"
                return (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-fondo-panel/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {f.pelicula && (
                          <Poster src={f.pelicula.poster} alt="" className="w-7 h-10 rounded object-cover object-top shrink-0" />
                        )}
                        <span className="font-semibold text-gray-800">{f.pelicula?.titulo ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{f.sala?.nombre ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatearDiaHora(f.fechaHora)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatearPrecio(f.precio ?? 0)}</td>
                    <td className="px-4 py-3">
                      <Badge variante={VARIANTE_ESTADO[f.estado] ?? "neutro"} className="capitalize">{f.estado}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => abrirEditar(f)}
                          disabled={!editable}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-primario-suave hover:text-primario transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          aria-label={`Editar función de ${f.pelicula?.titulo}`}
                          title={editable ? "Editar" : "Solo se editan funciones activas"}
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => abrirCancelar(f)}
                          disabled={!editable}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-error transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          aria-label={`Cancelar función de ${f.pelicula?.titulo}`}
                          title={editable ? "Cancelar" : "Solo se cancelan funciones activas"}
                        >
                          <Ban className="w-4 h-4" aria-hidden="true" />
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

      {/* Modal cancelar función con motivo + compras afectadas */}
      <Modal
        abierto={!!cancelacion}
        onCerrar={() => setCancelacion(null)}
        titulo={cancelacion?.hecha ? "Función cancelada" : "Cancelar función"}
      >
        {cancelacion && !cancelacion.hecha && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-700 font-cuerpo">
                Vas a cancelar la función de <strong>{cancelacion.funcion.pelicula?.titulo}</strong>
                {" "}({formatearDiaHora(cancelacion.funcion.fechaHora)}). Las entradas vendidas quedarán
                <strong> anuladas</strong> y las reservas se liberarán. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-cuerpo font-medium text-gray-700">Motivo de la cancelación</label>
              <textarea
                value={cancelacion.motivo}
                onChange={(e) => setCancelacion((c) => ({ ...c, motivo: e.target.value }))}
                rows={3}
                className="input-sivec resize-none"
                placeholder="Ej: Falla del proyector"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variante="fantasma" onClick={() => setCancelacion(null)}>Volver</Button>
              <Button variante="peligro" onClick={confirmarCancelar} cargando={cancelando}>Cancelar función</Button>
            </div>
          </div>
        )}

        {cancelacion?.hecha && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-fondo-panel rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500 font-cuerpo uppercase tracking-wide">Entradas anuladas</p>
                <p className="font-titulo font-extrabold text-xl text-gray-900">{cancelacion.entradasAnuladas}</p>
              </div>
              <div className="bg-fondo-panel rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500 font-cuerpo uppercase tracking-wide">Total a reembolsar</p>
                <p className="font-titulo font-extrabold text-xl text-primario">{formatearPrecio(cancelacion.totalReembolsar)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-cuerpo font-semibold text-gray-700 mb-2">
                Compras afectadas ({cancelacion.afectadas?.length ?? 0})
              </p>
              {(!cancelacion.afectadas || cancelacion.afectadas.length === 0) ? (
                <p className="text-sm text-gray-400 font-cuerpo">No había compras aprobadas para esta función.</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                  {cancelacion.afectadas.map((c) => (
                    <div key={c.compraId} className="border border-gray-100 rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-titulo font-semibold text-gray-800 text-sm">{c.cliente?.nombre ?? "—"}</p>
                        <p className="text-xs text-gray-500 font-cuerpo">
                          {c.numero} · {c.cantidadEntradas} entrada{c.cantidadEntradas !== 1 ? "s" : ""}
                          {" · "}<span className="capitalize">{c.metodoPago}</span>
                          {c.cliente?.documento ? ` · Doc: ${c.cliente.documento}` : ""}
                        </p>
                      </div>
                      <span className="font-titulo font-bold text-primario text-sm shrink-0">{formatearPrecio(c.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setCancelacion(null)}>Entendido</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
