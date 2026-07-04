# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# 🛍️ Mi Tienda — App de Pedidos (con Supabase)

Esta versión usa **Supabase** (base de datos en la nube) en vez de localStorage.
Esto significa que **todos los dispositivos comparten los mismos datos**: el admin
crea un pedido desde su tablet y los trabajadores lo ven desde sus celulares.

> **Nota:** esta versión NO usa Realtime — los pedidos se cargan al iniciar sesión
> y hay un botón 🔄 para refrescar manualmente. Si más adelante quieres que los
> pedidos aparezcan automáticamente sin refrescar, dímelo y lo agregamos.

---

## Paso 1 — Crear el proyecto en Supabase

1. Ve a **https://supabase.com** → Sign up (puedes usar tu cuenta de GitHub)
2. Click **"New Project"**
3. Llena:
   - **Name:** `mi-tienda`
   - **Database Password:** genera una segura y guárdala
   - **Region:** la más cercana (ej. `us-east-1`)
4. Click **"Create new project"** — tarda ~2 minutos

---

## Paso 2 — Crear las tablas

1. En el dashboard de tu proyecto, ve a **SQL Editor** (barra lateral) → **New query**
2. Abre el archivo `schema.sql` de este proyecto, copia todo su contenido
3. Pégalo en el editor y dale **Run** (botón verde, o `Ctrl+Enter`)
4. Deberías ver "Success. No rows returned"

Esto crea las tablas `users`, `orders`, `order_counter`, y los 4 usuarios de prueba.

---

## Paso 3 — Obtener tus credenciales

1. En el dashboard, ve a **Project Settings** (ícono de engranaje) → **API**
2. Copia:
   - **Project URL** → algo como `https://abcdefgh.supabase.co`
   - **anon public** key → una cadena larga que empieza con `eyJ...`

---

## Paso 4 — Configurar el proyecto local

```bash
cd mi-tienda
cp .env.example .env
```

Abre el archivo `.env` y pega tus credenciales:

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...tu-key-completa
```

---

## Paso 5 — Instalar y correr

```bash
npm install
npm run dev
```

Abre **http://localhost:5173**. Inicia sesión con cualquiera de estos usuarios:

| Usuario | PIN  | Rol           |
| ------- | ---- | ------------- |
| admin   | 1234 | Administrador |
| carlos  | 1111 | Trabajador    |
| maria   | 2222 | Trabajadora   |
| luis    | 3333 | Trabajador    |

Para cambiar usuarios o PINs, ve al **Table Editor** en Supabase → tabla `users`,
y edita las filas directamente ahí (sin tocar código).

---

## Paso 6 — Desplegar en Vercel

```bash
npm install -g vercel
vercel
```

**Importante:** en el dashboard de Vercel, ve a tu proyecto → **Settings → Environment
Variables** y agrega las mismas dos variables de tu `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Sin esto, la app desplegada no podrá conectarse a la base de datos.

---

## Estructura del proyecto

```
schema.sql                   ← Pégalo en Supabase SQL Editor (paso 2)
src/
├── App.jsx                  ← Lógica principal
├── api.js                   ← Todas las consultas a Supabase
├── supabaseClient.js        ← Conexión a Supabase
├── constants.js             ← Estados, métodos de pago
├── storage.js                ← Helper de IDs temporales
└── components/
    ├── LoginScreen.jsx
    ├── OrderCard.jsx
    ├── OrderForm.jsx
    ├── Receipt.jsx
    ├── ExportModal.jsx
    └── DeleteConfirmModal.jsx
```

---

## Plan gratuito de Supabase — límites

- 500 MB de base de datos
- 5 GB de transferencia/mes
- Pausa el proyecto tras 1 semana sin uso (se reactiva solo al volver a usarlo)

Para una tienda pequeña esto es más que suficiente.
