# 🎬 SIVEC — Sistema de Venta de Entradas para Eventos/Cine

Proyecto universitario — Ingeniería de Sistemas, Semestre VIII.
Frontend completo con datos simulados (mock), listo para conectar un backend Flask + PostgreSQL.

---

## 📋 Descripción

SIVEC es un sistema de venta de entradas para cine y eventos. Permite:

- **Clientes:** ver cartelera, elegir asientos, reservar (5 min), pagar (simulado) y recibir entrada con QR.
- **Taquilleros:** vender en taquilla (4 pasos), validar entradas (cámara / manual / imagen QR) y ver historial.
- **Administradores:** gestionar funciones, salas y usuarios, y consultar reportes con gráficas.

---

## 🛠️ Tecnologías

| Herramienta | Uso |
|---|---|
| React 18/19 + Vite | Framework UI y bundler |
| Tailwind CSS 3 | Estilos (tokens de diseño en `tailwind.config.js`) |
| React Router v6 | Navegación SPA con rutas protegidas por rol |
| Recharts | Gráficas del dashboard y reportes |
| lucide-react | Iconos |
| date-fns | Manejo y formato de fechas (locale español) |
| qrcode.react | Generación de códigos QR |
| html5-qrcode | Escaneo de QR por cámara y desde imagen |
| Context API | Estado global (sesión y carrito) |

---

## 🚀 Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo
npm run dev
# Abre http://localhost:5173

# 3. Compilar para producción
npm run build

# 4. Previsualizar el build
npm run preview
```

---

## 👤 Usuarios de prueba

Contraseña para todos: **`123456`**

| Correo | Rol | Accede a |
|---|---|---|
| `cliente@sivec.com` | Cliente | Cartelera, compra, mis compras, perfil |
| `taquillero@sivec.com` | Taquillero | Venta en taquilla, validación, historial |
| `admin@sivec.com` | Administrador | Dashboard, funciones, salas, usuarios, reportes |

En la pantalla de login hay **botones de acceso rápido** por rol para la demostración.

---

## 📂 Estructura del proyecto

```
src/
├── components/
│   ├── ui/              # Componentes base (Button, Card, Input, Badge, Modal,
│   │                    #   Toast, Spinner, EstadoVacio, MensajeError)
│   ├── Navbar.jsx       # Barra pública
│   ├── Sidebar.jsx      # Menú lateral del panel
│   ├── Topbar.jsx       # Barra superior del panel
│   ├── Footer.jsx
│   ├── Logo.jsx         # Logo centralizado
│   ├── MovieCard.jsx    # Tarjeta de película
│   ├── SeatMap.jsx      # Mapa de asientos interactivo (tipo butaca)
│   ├── Countdown.jsx    # Cuenta regresiva de reserva
│   ├── QRTicket.jsx     # Entrada con código QR
│   ├── StatCard.jsx     # Métrica del dashboard
│   ├── PasoIndicador.jsx# Stepper del wizard de taquilla
│   └── ErrorBoundary.jsx# Captura errores de React
├── layouts/
│   ├── PublicLayout.jsx # Navbar + Footer (público/cliente)
│   └── PanelLayout.jsx  # Sidebar + Topbar (taquilla/admin)
├── pages/
│   ├── public/          # Landing, Login, Registro, 404, Demo, Componentes
│   ├── cliente/         # Cartelera, Asientos, Resumen, Pago, EntradaQR, MisCompras, Perfil
│   ├── taquilla/        # VentaTaquilla, ValidarEntrada, HistorialVentas
│   └── admin/           # Dashboard, Funciones, Salas, Usuarios, Reportes
├── services/            # Capa de acceso a datos (mock hoy, Flask después)
│   ├── config.js        # URL base y MODO_MOCK
│   ├── almacenamiento.js# Persistencia en localStorage (se elimina con Flask)
│   ├── authService.js
│   ├── peliculasService.js
│   ├── funcionesService.js
│   ├── salasService.js
│   ├── asientosService.js
│   ├── comprasService.js
│   ├── entradasService.js
│   └── reportesService.js
├── data/                # Datos mock iniciales (JS)
├── context/             # AuthContext, CartContext
├── hooks/               # useFuncion, useTaquilla, useRefrescoAlEnfocar
├── utils/               # cn (clases), formato (precio/duración/countdown)
└── routes/              # AppRoutes, ProtectedRoute, menuConfig
```

---

## 🔐 Roles y permisos

Las rutas están protegidas por `ProtectedRoute`:

- Un cliente que intente entrar a `/panel/admin` verá **"Acceso denegado"**.
- Un usuario sin sesión es redirigido a `/login`.

---

## 📐 Reglas de negocio implementadas

- Un asiento tiene **un solo estado**: disponible, reservado o vendido.
- La reserva dura **5 minutos** con cuenta regresiva; al vencer, el asiento vuelve a disponible.
- **No se venden** entradas de funciones ya iniciadas o finalizadas.
- Cada entrada tiene un **código único** y solo puede usarse una vez (activa → usada).
- Si una función se cancela, sus entradas pasan a **anulada**.
- El pago es **simulado** (tarjeta falsa, con opción de simular rechazo).

---

## 🗃️ Sobre los datos (mock)

Hoy el frontend usa **datos simulados** que viven en `src/data/` y se gestionan desde `src/services/`.

Para que la demo sea realista, los cambios se **persisten en `localStorage`**
(ver `src/services/almacenamiento.js`): si el admin cambia un precio, se refleja
en los demás paneles y sobrevive a recargas.

> Para restaurar los datos originales hay un botón **"Reiniciar datos de prueba"**
> en el Dashboard del administrador.

---

## 🔌 Conexión futura con backend Flask

El cambio a Flask solo toca la **capa de servicios**, no los componentes:

1. Copia `.env.example` a `.env.local` y define `VITE_API_URL`.
2. En `src/services/config.js`, cambia `MODO_MOCK = false`.
3. En cada archivo de `src/services/`, reemplaza el cuerpo de las funciones
   (que hoy leen mock) por llamadas `fetch`/`axios` a la API.
4. Elimina `src/services/almacenamiento.js` (el backend será la fuente de verdad).

Los componentes y páginas **no requieren cambios**.

---

## ♿ Accesibilidad

- Navegación por teclado en el mapa de asientos (Enter/Espacio).
- Enlace "Saltar al contenido" para lectores de pantalla.
- `aria-label`, `role` y `aria-live` en toasts, modales y resultados de validación.
- Contraste de color acorde a los tokens de diseño.

> Nota: la validación WCAG completa requiere pruebas manuales con tecnologías de asistencia.

---

## 📄 Páginas (18)

**Cliente:** Landing · Login · Registro · Cartelera · Selección de asientos ·
Resumen · Pago · Entrada QR · Mis compras · Perfil

**Taquilla:** Venta en taquilla · Validar entrada · Historial de ventas

**Admin:** Dashboard · Funciones · Salas · Usuarios · Reportes

---

© 2026 SIVEC — Proyecto universitario. Datos simulados, sin valor comercial.
