/** Si quedan 10 asientos o menos se avisa "Quedan N". */
export const UMBRAL_POCOS_ASIENTOS = 10

/** ¿La función no tiene asientos? Solo true si el dato es numérico. */
export function estaAgotada(funcion) {
  return typeof funcion?.asientosDisponibles === "number" && funcion.asientosDisponibles <= 0
}
