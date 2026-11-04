/**
 * usuariosService.js — Gestión de usuarios para el administrador.
 *
 * AÚN SIMULADO: se migra a la API en la Fase I6 (GET/POST/PUT/DELETE /usuarios).
 * Al migrarlo hay que usar rolDesdeApi / rolHaciaApi / usuarioDesdeApi de authService.js
 * para que los formularios sigan trabajando con el rol "admin".
 *
 * Diferencias de la API que se resolverán en la Fase I6 (ver inventario de la Fase I0):
 *   - Solo se pueden crear taquilleros y administradores.
 *   - Los usuarios no tienen teléfono ni documento.
 *   - DELETE desactiva al usuario, no lo borra.
 */

export {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  alternarActivoUsuario,
  eliminarUsuario,
} from "./mock/usuariosMock"
