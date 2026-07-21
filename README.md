# Castro AI

Centro de comando personal para **Team Fernando Castro** (RE/MAX Premium). PWA instalable en iPhone: War Room con KPIs automáticos, Calendario del día por colores, y Tareas con recordatorio por email — todo alimentado por tu Google Calendar real.

## ¿Qué hay en este proyecto?

```
castro-ai/
├── client/     → App React + Vite + Tailwind (PWA, funciona offline)
└── server/     → Backend Node/Express que hace de proxy hacia Google Calendar
```

Todo lo que te da personalidad a la app está separado del resto del código:

- [`client/src/config/brand.js`](client/src/config/brand.js) → nombre, colores, datos del agente inmobiliario. Cambiar este archivo rebrandiza toda la app.

## 1. Requisitos

- [Node.js](https://nodejs.org) 18 o superior instalado en tu computadora.
- Credenciales de Google Calendar (ver sección 6) — sin esto, el War Room, el Calendario y los recordatorios de Tareas no tienen datos para mostrar.

## 2. Instalar

Abrí una terminal en la carpeta `castro-ai` y corré:

```bash
npm run install:all
```

Esto instala las dependencias del client y del server.

## 3. Configurar variables de entorno (en local)

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Las credenciales de Google se cargan en `server/.env` — ver sección 6 para conseguirlas.

## 4. Correr en local

Desde la carpeta `castro-ai`:

```bash
npm run dev
```

Esto levanta el frontend en `http://localhost:5173` y el backend en `http://localhost:8787` al mismo tiempo.

## 5. Deployar (Render o Railway)

El backend sirve el build del frontend, así que en producción es **un solo servicio Node**.

### Con Render (recomendado)

1. Subí este proyecto a un repositorio de GitHub.
2. En [Render](https://render.com), creá un **Web Service** nuevo apuntando a ese repo.
3. Configurá:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
4. En **Environment Variables** cargá `NODE_ENV=production`, `CLIENT_ORIGIN` (la URL que te da Render) y las credenciales de Google Calendar (sección 6).
5. Deploy. Cuando termine, vas a tener una URL tipo `https://castro-ai.onrender.com`.

Railway funciona igual: mismo build command, mismo start command, mismas variables de entorno.

## 6. Instalar en tu iPhone

1. Abrí Safari (tiene que ser Safari, no Chrome) y entrá a la URL de tu app (en local: la IP de tu compu en la misma red + `:5173`; en producción: tu URL de Render).
2. Tocá el botón de **Compartir** (el cuadrado con la flecha hacia arriba) en la barra inferior.
3. Deslizá y elegí **"Agregar a pantalla de inicio"**.
4. Confirmá el nombre ("Castro AI") y tocá **Agregar**.
5. Ya la tenés como una app más en tu iPhone, con ícono propio y sin la barra de Safari.

## 7. Conectar Google Calendar

Esto alimenta tres cosas: los KPIs automáticos del War Room, la vista de **Calendario** (tu día, coloreado por negocio/personal) y los **recordatorios por email** de Tareas.

### 7.1 Crear las credenciales en Google Cloud Console

1. Entrá a [console.cloud.google.com](https://console.cloud.google.com) con tu cuenta de Google y creá un proyecto nuevo (o usá uno existente).
2. **APIs & Services → Library** → buscá **Google Calendar API** → **Enable**.
3. **APIs & Services → OAuth consent screen**:
   - **User Type**: External (o Interno si tu cuenta es de un Google Workspace).
   - Completá nombre de la app y tu email.
   - **Test users**: agregá tu propia cuenta de Gmail (así podés usarla sin que Google la revise/verifique).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - **Application type**: Web application.
   - **Authorized redirect URIs**: agregá las dos:
     - `http://localhost:8787/api/calendar/callback` (para probar en tu compu)
     - `https://castro-ai.onrender.com/api/calendar/callback` (producción)
   - Creá y copiá el **Client ID** y el **Client Secret**.

### 7.2 Cargar las credenciales

**En local** (`server/.env`):

```
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8787/api/calendar/callback
```

**En Render** (Environment Variables del servicio): las mismas tres, pero con
`GOOGLE_REDIRECT_URI=https://castro-ai.onrender.com/api/calendar/callback`.

### 7.3 Conectar y copiar el token

1. Entrá a **Ajustes → Google Calendar → Conectar Google Calendar** y aceptá el permiso (lectura y creación de eventos — hace falta para los recordatorios de Tareas).
2. **En local** queda conectado automáticamente.
3. **En producción**, Google te va a mostrar una pantalla con un texto largo (el `refresh_token`) — copialo y pegalo en Render como variable `GOOGLE_REFRESH_TOKEN`, guardá, y esperá a que el servicio reinicie. Es un paso único: no hay que repetirlo salvo que revoques el acceso desde tu cuenta de Google.

> Si ya tenías el calendario conectado de antes (cuando solo se leía, sin crear recordatorios), **reconectalo una vez** desde Ajustes para habilitar el permiso de escritura — el link de Google te va a pedir que confirmes el permiso nuevo.

### 7.4 Cómo se categorizan los KPIs del War Room

| KPI | Palabra clave en el título |
|---|---|
| Prelistings | "prelisting" |
| Tasaciones | "tasación" |
| Captaciones | "autorización de venta" (o "captación") |
| Muestras | "mostrar" |
| Reservas | "reservar" |
| Cierres | "escritura" |

Los eventos recurrentes (recordatorios diarios/semanales) no cuentan — solo eventos puntuales. Para Cierres, además se excluyen los títulos que digan "retirar", "prórroga", "posible", "gastos" o "reintegrar" junto con "escritura" — son trámites o recordatorios sobre una escritura, no el cierre en sí.

La vista de **Calendario** usa una clasificación más laxa (negocio vs. personal, solo para el color) con una lista más amplia de palabras — ver `NEGOCIO_KEYWORDS` en [`server/routes/calendar.js`](server/routes/calendar.js) si querés ajustarla.

## Notas

- Las tareas y los KPIs se guardan en el dispositivo (IndexedDB) — no viajan a ningún servidor más que tu propio backend cuando hablan con Google Calendar.
- El recordatorio por email de una tarea se implementa creando un evento en tu Google Calendar con un aviso por email y por notificación — el envío lo hace Google, no este servidor.
- Para revender esta app a otro agente inmobiliario: cloná el proyecto, editá `config/brand.js`, y cada uno deploya su propia instancia con sus propias credenciales de Google.
