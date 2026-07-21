# Castro AI

Centro de comando personal con agentes de IA para **Team Fernando Castro** (RE/MAX Premium). PWA instalable en iPhone: 6 agentes especializados, mini CRM, tareas y un War Room con tus KPIs.

## ¿Qué hay en este proyecto?

```
castro-ai/
├── client/     → App React + Vite + Tailwind (PWA, funciona offline)
└── server/     → Backend Node/Express que hace de proxy hacia Claude (tu API key nunca queda expuesta en el navegador)
```

Todo lo que te da personalidad a la app está separado del resto del código:

- [`client/src/config/brand.js`](client/src/config/brand.js) → nombre, colores, datos del agente inmobiliario. Cambiar este archivo rebrandiza toda la app.
- [`client/src/config/agents.js`](client/src/config/agents.js) → los 6 agentes (nombre, avatar, color, system prompt). Agregar un agente nuevo es agregar un objeto al array.

También podés editar los system prompts de cada agente sin tocar código, desde **Ajustes** dentro de la app.

## 1. Requisitos

- [Node.js](https://nodejs.org) 18 o superior instalado en tu computadora.
- Una API key de Anthropic. Se consigue gratis (con crédito inicial) en [console.anthropic.com](https://console.anthropic.com) → **API Keys** → **Create Key**.

## 2. Instalar

Abrí una terminal en la carpeta `castro-ai` y corré:

```bash
npm run install:all
```

Esto instala las dependencias del client y del server.

## 3. Cargar tu API key (en local)

Copiá los archivos de ejemplo:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Abrí `server/.env` y pegá tu API key en `ANTHROPIC_API_KEY`:

```
ANTHROPIC_API_KEY=sk-ant-tu-key-acá
ANTHROPIC_MODEL=claude-sonnet-5
```

> Tip: también podés dejar `ANTHROPIC_API_KEY` vacío y cargarla después desde **Ajustes → API key de Anthropic** dentro de la app (solo funciona así en local, en producción se configura desde el hosting — ver más abajo).

## 4. Correr en local

Desde la carpeta `castro-ai`:

```bash
npm run dev
```

Esto levanta el frontend en `http://localhost:5173` y el backend en `http://localhost:8787` al mismo tiempo. Abrí `http://localhost:5173` en el navegador y probá los agentes, el CRM y las tareas.

## 5. Deployar (Render o Railway)

El backend sirve el build del frontend, así que en producción es **un solo servicio Node**.

### Con Render (recomendado)

1. Subí este proyecto a un repositorio de GitHub.
2. En [Render](https://render.com), creá un **Web Service** nuevo apuntando a ese repo.
3. Configurá:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
4. En **Environment Variables** cargá:
   - `ANTHROPIC_API_KEY` → tu key real
   - `ANTHROPIC_MODEL` → `claude-sonnet-5`
   - `NODE_ENV` → `production`
   - `CLIENT_ORIGIN` → la URL que te va a dar Render (podés dejarlo para el final y actualizarlo)
5. Deploy. Cuando termine, vas a tener una URL tipo `https://castro-ai.onrender.com`.

Railway funciona igual: mismo build command, mismo start command, mismas variables de entorno.

> En producción, la API key **no** se carga desde Ajustes dentro de la app — se configura una sola vez en el panel de variables de entorno del hosting. Es más seguro y evita que la key dependa del filesystem del servidor.

## 6. Instalar en tu iPhone

1. Abrí Safari (tiene que ser Safari, no Chrome) y entrá a la URL de tu app (en local: la IP de tu compu en la misma red + `:5173`; en producción: tu URL de Render).
2. Tocá el botón de **Compartir** (el cuadrado con la flecha hacia arriba) en la barra inferior.
3. Deslizá y elegí **"Agregar a pantalla de inicio"**.
4. Confirmá el nombre ("Castro AI") y tocá **Agregar**.
5. Ya la tenés como una app más en tu iPhone, con ícono propio y sin la barra de Safari.

## 7. Conectar Google Calendar (opcional)

Esto hace que el War Room actualice solo Prelistings, Tasaciones y Captaciones a partir de tu calendario real. Se categoriza por palabra clave en el título del evento: **"tasación"**, **"prelisting"**, **"captación"** o **"autorización de venta"**. Los eventos recurrentes (recordatorios diarios/semanales) no cuentan — solo eventos puntuales.

### 7.1 Crear las credenciales en Google Cloud Console

1. Entrá a [console.cloud.google.com](https://console.cloud.google.com) con tu cuenta de Google y creá un proyecto nuevo (o usá uno existente).
2. **APIs & Services → Library** → buscá **Google Calendar API** → **Enable**.
3. **APIs & Services → OAuth consent screen**:
   - **User Type**: External.
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

1. Entrá a **Ajustes → Google Calendar → Conectar Google Calendar** y aceptá el permiso (solo lectura).
2. **En local** queda conectado automáticamente.
3. **En producción**, Google te va a mostrar una pantalla con un texto largo (el `refresh_token`) — copialo y pegalo en Render como variable `GOOGLE_REFRESH_TOKEN`, guardá, y esperá a que el servicio reinicie. Es un paso único: no hay que repetirlo salvo que revoques el acceso desde tu cuenta de Google.

## Notas

- El historial de chats, los contactos, las tareas y los KPIs se guardan en el dispositivo (IndexedDB) — no viajan a ningún servidor más que tu propio backend cuando le hablás a un agente.
- Cada mensaje a un agente consume uso de la API de Anthropic (algunos centavos con Sonnet). Para uso personal es muy bajo costo.
- Para revender esta app a otro agente inmobiliario: cloná el proyecto, editá `config/brand.js` y `config/agents.js`, y cada uno deploya su propia instancia con su propia API key.
