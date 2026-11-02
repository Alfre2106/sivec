# 🎬 SIVEC — Sistema de Venta de Entradas para Eventos/Cine

Proyecto universitario — Ingeniería de Sistemas, Semestre VIII.

---

## Tecnologías

| Herramienta | Versión | Uso |
|---|---|---|
| React | 18/19 | Framework UI |
| Vite | 8 | Bundler y dev server |
| Tailwind CSS | 3 | Estilos utilitarios |
| React Router | 6 | Navegación SPA |
| Recharts | última | Gráficas del dashboard |
| lucide-react | última | Iconos |
| date-fns | última | Manejo de fechas |
| qrcode.react | última | Generación de QR |
| html5-qrcode | última | Escaneo de QR con cámara |
| zustand | última | Estado global (si se necesita) |

---

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd sivec

# Instalar dependencias
npm install
```

---

## Ejecución en desarrollo

```bash
npm run dev
```

La app estará disponible en [http://localhost:5173](http://localhost:5173).

---

## Usuarios de prueba

| Correo | Contraseña | Rol |
|---|---|---|
| cliente@sivec.com | 123456 | Cliente |
| taquillero@sivec.com | 123456 | Taquillero |
| admin@sivec.com | 123456 | Administrador |

---

## Estructura del proyecto

```
src/
├── components/
│   ├── ui/          # Componentes shadcn/ui base
│   └── ...          # Componentes reutilizables (SeatMap, MovieCard, etc.)
├── layouts/
│   ├── PublicLayout.jsx   # Layout para páginas públicas y cliente
│   └── PanelLayout.jsx    # Layout para taquillero y administrador
├── pages/
│   ├── public/      # Landing, Login, Registro
│   ├── cliente/     # Cartelera, Asientos, Pago, QR, Mis Compras
│   ├── taquilla/    # Venta, Validación, Historial
│   └── admin/       # Dashboard, Funciones, Salas, Usuarios, Reportes
├── services/        # Capa de servicios (mock hoy, Flask después)
│   ├── config.js
│   ├── authService.js
│   ├── funcionesService.js
│   ├── asientosService.js
│   ├── comprasService.js
│   └── entradasService.js
├── data/            # Datos mock (JSON / JS)
├── context/         # AuthContext, CartContext
├── hooks/           # Custom hooks
├── utils/           # Funciones utilitarias
└── routes/          # AppRoutes, ProtectedRoute
```

---

## Fases de desarrollo

- [x] **Fase 0** — Setup: Tailwind, tokens de diseño, rutas, layouts, servicios mock
- [ ] **Fase 1** — Componentes base: Navbar, Sidebar, botones, tarjetas
- [ ] **Fase 2** — Flujo del cliente (pantallas 1–10)
- [ ] **Fase 3** — Taquilla y validación (pantallas 11–13)
- [ ] **Fase 4** — Administración y reportes (pantallas 14–18)
- [ ] **Fase 5** — Pulido: responsive, accesibilidad, README final

---

## Conexión con backend Flask (futura)

Cuando el backend esté listo:

1. Copia `.env.example` a `.env.local`
2. Define `VITE_API_URL=http://localhost:5000/api`
3. Cambia `MODO_MOCK = false` en `src/services/config.js`
4. Reemplaza el cuerpo de cada función en `/services` por llamadas `fetch`/`axios`

Los componentes **no necesitan cambios**.

---

## Variables de entorno

```env
# .env.local (crear manualmente, no versionar)
VITE_API_URL=http://localhost:5000/api
```
