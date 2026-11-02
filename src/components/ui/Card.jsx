/**
 * Card.jsx — Tarjeta base con slots opcionales para Header, Body y Footer.
 *
 * Uso:
 *   <Card>contenido</Card>
 *   <Card className="p-0 overflow-hidden">
 *     <CardHeader>Título</CardHeader>
 *     <CardBody>Contenido</CardBody>
 *   </Card>
 */

import { cn } from "@/utils/cn"

/** Contenedor principal de la tarjeta */
export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-white rounded-sivec shadow-tarjeta border border-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** Cabecera de la tarjeta con borde inferior */
export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn("px-6 py-4 border-b border-gray-100", className)}
      {...props}
    >
      {children}
    </div>
  )
}

/** Cuerpo principal de la tarjeta */
export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  )
}

/** Pie de tarjeta con borde superior */
export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn("px-6 py-4 border-t border-gray-100", className)}
      {...props}
    >
      {children}
    </div>
  )
}
