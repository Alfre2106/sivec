/**
 * peliculasAdminService.js — Gestión de películas para el administrador.
 *
 * AÚN SIMULADO: se migra a la API en la Fase I6 (POST/PUT/DELETE /peliculas).
 * Hoy solo expone el listado completo que usa el selector de "Nueva Función" del panel,
 * que sigue trabajando con las funciones simuladas (funcionesAdminService.js), por eso
 * necesita las películas simuladas y no las de la API.
 *
 * Diferencias de la API que se resolverán en la Fase I6:
 *   - DELETE solo desactiva la película.
 *   - No hay un listado de películas inactivas.
 */

export { listarTodasPeliculas } from "./mock/peliculasMock"
