/**
 * ids.js — Comparación de ids que llegan de distintos orígenes.
 *
 * El id de una ruta (useParams) siempre es TEXTO; el id de la API es un NÚMERO y el de
 * los datos simulados es texto ("f01"). Comparar con === o !== falla entre "5" y 5.
 */

/**
 * ¿Son el mismo id, sin importar si uno es número y el otro texto?
 * @param {string|number|null|undefined} a
 * @param {string|number|null|undefined} b
 * @returns {boolean}
 */
export function mismoId(a, b) {
  if (a === null || a === undefined || b === null || b === undefined) return false
  return String(a) === String(b)
}
