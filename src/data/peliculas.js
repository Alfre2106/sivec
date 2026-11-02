/**
 * peliculas.js — Catálogo de películas/eventos de SIVEC.
 * Las imágenes usan placeholders con colores distintos para diferenciarlas.
 * NO se usan pósters con copyright.
 */

export const PELICULAS_MOCK = [
  {
    id: "p1",
    titulo: "Intensamente 2",
    genero: "Animación / Comedia",
    duracion: 120,   // minutos
    clasificacion: "Todo público",
    sinopsis:
      "Las emociones de Riley vuelven en una aventura completamente nueva cuando aparece una emoción inesperada que lo cambia todo.",
    // Placeholder: imagen con color de fondo y texto
    poster: "https://placehold.co/300x420/7C3AED/FFFFFF?text=Intensamente+2",
    banner: "https://placehold.co/1200x500/7C3AED/FFFFFF?text=Intensamente+2",
    idioma: "Español",
    director: "Kelsey Mann",
    activo: true,
  },
  {
    id: "p2",
    titulo: "Deadpool & Wolverine",
    genero: "Acción / Superhéroes",
    duracion: 127,
    clasificacion: "Mayores de 16",
    sinopsis:
      "Deadpool y Wolverine unen fuerzas en una misión que pondrá a prueba sus límites y su paciencia mutua.",
    poster: "https://placehold.co/300x420/DC2626/FFFFFF?text=Deadpool+%26+Wolverine",
    banner: "https://placehold.co/1200x500/DC2626/FFFFFF?text=Deadpool+%26+Wolverine",
    idioma: "Español",
    director: "Shawn Levy",
    activo: true,
  },
  {
    id: "p3",
    titulo: "Moana 2",
    genero: "Animación / Aventura",
    duracion: 110,
    clasificacion: "Todo público",
    sinopsis:
      "Moana emprende un nuevo viaje por los océanos del Pacífico para descubrir los secretos de su pueblo.",
    poster: "https://placehold.co/300x420/0EA5E9/FFFFFF?text=Moana+2",
    banner: "https://placehold.co/1200x500/0EA5E9/FFFFFF?text=Moana+2",
    idioma: "Español",
    director: "David Derrick Jr.",
    activo: true,
  },
  {
    id: "p4",
    titulo: "Alien: Romulus",
    genero: "Terror / Ciencia Ficción",
    duracion: 119,
    clasificacion: "Mayores de 16",
    sinopsis:
      "Un grupo de jóvenes colonizadores en el espacio profundo se encuentran cara a cara con la forma de vida más aterradora del universo.",
    poster: "https://placehold.co/300x420/1F2937/FFFFFF?text=Alien%3A+Romulus",
    banner: "https://placehold.co/1200x500/1F2937/FFFFFF?text=Alien%3A+Romulus",
    idioma: "Español",
    director: "Fede Álvarez",
    activo: true,
  },
  {
    id: "p5",
    titulo: "Concierto Sinfónico Gala",
    genero: "Evento / Música",
    duracion: 90,
    clasificacion: "Todo público",
    sinopsis:
      "Una noche especial con la Orquesta Filarmónica interpretando las piezas más icónicas de la historia de la música clásica.",
    poster: "https://placehold.co/300x420/059669/FFFFFF?text=Concierto+Sinf%C3%B3nico",
    banner: "https://placehold.co/1200x500/059669/FFFFFF?text=Concierto+Sinf%C3%B3nico",
    idioma: "Instrumental",
    director: "Orquesta Filarmónica",
    activo: true,
  },
]
