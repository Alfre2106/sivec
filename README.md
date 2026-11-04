# 🎬 SIVEC — Sistema de Venta de Entradas para Eventos/Cine

Proyecto universitario — Ingeniería de Sistemas, Semestre VIII.
Frontend en React + Vite conectado a una API real (Flask + PostgreSQL).

---

## 📋 Descripción

SIVEC es un sistema de venta de entradas para cine y eventos. Permite:

- **Clientes:** ver cartelera, elegir asientos, reservar (5 min), pagar (simulado) y recibir entrada con QR.
- **Taquilleros:** vender en taquilla (4 pasos), validar entradas (cámara / manual / imagen QR) y ver historial.
- **Administradores:** gestionar películas, salas, funciones y usuarios, y consultar reportes con gráficas y exportación a CSV.

El pago es simulado por diseño (con opción de rechazo); el resto del flujo es real contra la API.

---

## 🛠️ Tecnologías

| Herramienta | Uso |
|---|---|
| React 19 + Vite | Framework UI y bundler |
| Tailwind CSS 3 | Estilos (tokens de diseño en `tailwind.config.js`) |
| React Router v6 | Navegación SPA con rutas protegidas por rol |
| Recharts | Gráficas del dashboard y reportes |
| lucide-react | Iconos |
| qrcode.react | Generación de códigos QR |
| html5-qrcode | Escaneo de QR por cámara y desde imagen |
| Context API | Estado global (sesión y carrito) |

Las fechas se muestran en hora de Bogotá con `Intl.DateTimeFormat` y los precios en COP con `Intl.NumberFormat` (sin depender de librerías de fecha).

---

## 🚀 Ejecutar frontend + backend juntos

SIVEC necesita el backend (Flask + PostgreSQL) corriendo para funcionar con datos reales.

### 1. Backend

Arranca la API según su propio README. Debe quedar escuchando en:

```
http://localhost:5000
```

El backend solo acepta peticiones desde el origen `http://localhost:5173` (CORS), así que **el frontend debe correr exactamente en ese puerto** (ver abajo).

### 2. Frontend

```bash
# Instalar dependencias (una vez)
npm install

# Copiar la plantilla de entorno y ajustarla si hace falta
Copy-Item .env.example .env     # PowerShell   (o: cp .env.example .env)

# Ejecutar en desarrollo en el puerto 5173 (obligatorio por el CORS del backend)
npm run dev -- --port 5173 --strictPort
# Abre http://localhost:5173
```

### 3. Build de producción

```bash
npm run build      # compila a dist/
npm run preview    # previsualiza el build
```

---

## ⚙️ Variables de entorno

Archivo `.env` (plantilla en `.env.example`). Vite lo lee **solo al arrancar**: si lo cambias, reinicia `npm run dev`.

| Variable | Valor | Significado |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | URL base de la API (sin barra final) |
| `VITE_USE_MOCK` | `false` | `false` → API real (recomendado). `true` → datos simulados locales, sin backend |

El interruptor `VITE_USE_MOCK=true` es útil para una demo offline: toda la app vuelve a usar los datos de `src/data/` sin tocar el backend. Si la variable falta, se usa la API real.

---

## 👤 Usuarios de prueba

Contraseña para todos: **`123456`** (los define el seed del backend).

| Correo | Rol | Accede a |
|---|---|---|
| `cliente@sivec.com` | Cliente | Cartelera, compra, mis compras, perfil |
| `taquillero@sivec.com` | Taquillero | Venta en taquilla, validación, historial |
| `admin@sivec.com` | Administrador | Dashboard, películas, funciones, salas, usuarios, reportes |

En la pantalla de login hay **botones de acceso rápido** por rol para la demostración.

---

## 🧱 Arquitectura: capa de servicios

Los componentes **nunca** llaman a `fetch` ni leen datos directamente: todo pasa por `src/services/`.

- `src/services/apiClient.js` es la **única** pieza que habla con la red: añade el token, unifica los errores como `ApiError { codigo, mensaje, status, detalle }`, cancela con `AbortController` y maneja la sesión vencida (401).
- Cada servicio (`authService`, `peliculasService`, `funcionesService`, `asientosService`, `comprasService`, `entradasService`, `salasService`, `usuariosService`, `funcionesAdminService`, `peliculasAdminService`, `reportesService`) elige entre su implementación real y la simulada según `usaApi("nombre")` de `config.js`.
- La lógica simulada vive en `src/services/mock/` y se activa con `VITE_USE_MOCK=true`.

Así, cambiar entre API real y datos simulados es un solo interruptor, sin tocar pantallas.

```
src/
├── components/          # UI base + componentes (Poster, SeatMap, QRTicket, Countdown, …)
├── layouts/             # PublicLayout (navbar+footer) y PanelLayout (sidebar+topbar)
├── pages/
│   ├── public/          # Landing, Login, Registro, Eventos, Contacto, 404
│   ├── cliente/         # Cartelera, Asientos, Resumen, Pago, EntradaQR, MisCompras, Perfil
│   ├── taquilla/        # VentaTaquilla, ValidarEntrada, HistorialVentas
│   └── admin/           # Dashboard, Peliculas (en Funciones), Salas, Usuarios, Funciones, Reportes
├── services/
│   ├── apiClient.js     # Cliente HTTP único
│   ├── config.js        # API_BASE_URL, USE_MOCK, usaApi()
│   ├── *.js             # Un servicio por dominio (facade API/mock)
│   └── mock/            # Implementación simulada de cada servicio
├── context/             # AuthContext, CartContext
├── hooks/               # useFuncion, useTaquilla, useRefrescoAlEnfocar
├── utils/               # cn, formato (precio/duración), fechas (hora de Bogotá), ids
└── routes/              # AppRoutes, ProtectedRoute
```

> Las rutas `/demo` y `/componentes` son showcases internos del sistema de diseño y solo existen en modo desarrollo; no entran al build de producción.

---

## 🔐 Roles y permisos

Las rutas están protegidas por `ProtectedRoute` (el rol lo confirma el backend):

- Un cliente que intente entrar a `/panel/admin` ve **"Acceso denegado"**.
- Un usuario sin sesión es redirigido a `/login` y, al entrar, vuelve a donde iba.
- Si el token vence o es inválido, la sesión se cierra sola.

---

## 📐 Reglas de negocio

- Un asiento tiene **un solo estado**: disponible, reservado o vendido.
- La reserva dura **5 minutos** con cuenta regresiva (el tiempo lo da el servidor); al vencer, el asiento vuelve a disponible.
- El mapa de asientos se **refresca cada 5 s** sin solapar peticiones y se pausa con la pestaña oculta.
- **No se venden** entradas de funciones canceladas, iniciadas o finalizadas.
- Cada entrada tiene un **código único** y solo puede usarse una vez (activa → usada); una validación repetida muestra "ya usada" con su fecha.
- Si una función se cancela (con motivo), sus entradas pasan a **anulada** y se muestran las compras afectadas y el total a reembolsar.
- El pago es **simulado** (`resultado_simulado`); los datos de la tarjeta nunca salen del navegador.

---

## ♿ Accesibilidad

- Navegación por teclado en el mapa de asientos (Enter/Espacio).
- Enlace "Saltar al contenido" para lectores de pantalla.
- `aria-label`, `role` y `aria-live` en toasts, modales y resultados de validación.

> La validación WCAG completa requiere pruebas manuales con tecnologías de asistencia y revisión experta.

---

© 2026 SIVEC — Proyecto universitario. Datos simulados en el pago, sin valor comercial.
