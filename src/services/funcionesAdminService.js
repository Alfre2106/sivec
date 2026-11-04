/**
 * funcionesAdminService.js — Gestión de funciones para el administrador.
 *
 * AÚN SIMULADO: se migra a la API en la Fase I6 (GET /funciones?todas=1, POST, PUT y
 * POST /funciones/{id}/cancelar). Por eso la tabla del panel muestra funciones simuladas,
 * distintas a las de la cartelera, que ya vienen del backend.
 *
 * Diferencias de la API que se resolverán en la Fase I6 (ver inventario de la Fase I0):
 *   - No existe "reactivar" una función cancelada.
 *   - Cancelar pide un motivo y devuelve las compras afectadas.
 *   - Con ventas o reservas solo se puede cambiar el precio.
 */

export {
  listarTodasFunciones,
  crearFuncion,
  actualizarFuncion,
  cancelarFuncion,
} from "./mock/funcionesMock"
