# Aplicación Web de Gestión de Portafolio y Financiamiento

Esta es una aplicación web completa para la gestión activa de un negocio de financiamiento apalancado. La aplicación permite al usuario (el gestor) administrar todo el ciclo de vida de la operación: desde la configuración de los parámetros del negocio y la cartera de inversión, hasta la creación y seguimiento de préstamos individuales para cada cliente.

## Arquitectura

La aplicación consta de dos partes principales:

- **Frontend:** Una aplicación de una sola página (SPA) construida con React y Vite. Se encuentra en el directorio `dashboard-app`.
- **Backend:** Una API RESTful construida con Node.js y Express. Se encuentra en el directorio `server`.

La base de datos utilizada es PostgreSQL.

## Características

- **Gestión de Clientes:** CRUD completo para clientes.
- **Gestión de Proyectos:** CRUD completo para proyectos de financiamiento, con generación automática de tablas de amortización.
- **Gestión de Portafolio:** Seguimiento de los activos que sirven como colateral.
- **Dashboard en Tiempo Real:** Visualización de KPIs clave como LTV, deuda total, etc.
- **Autenticación:** Sistema de login seguro basado en JWT.

## Cómo Empezar

### Prerrequisitos

- Node.js (v16+)
- npm
- PostgreSQL

### Instalación

1. **Clonar el repositorio.**

2. **Instalar dependencias del backend:**
   ```bash
   cd server
   npm install
   ```

3. **Instalar dependencias del frontend:**
   ```bash
   cd ../dashboard-app
   npm install
   ```

### Configuración del Backend

1. **Crear una base de datos en PostgreSQL.**

2. **Crear un archivo `.env` en el directorio `server`** a partir del archivo `.env.example` y rellenar las variables de entorno:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
   JWT_SECRET="your_super_secret_key"
   ```

3. **Ejecutar el script de inicialización de la base de datos:**
   ```bash
   cd server
   npm run db:init
   ```

### Ejecutar la Aplicación

1. **Iniciar el backend:**
   ```bash
   cd server
   npm start
   ```
   El servidor se ejecutará en `http://localhost:3001`.

2. **Iniciar el frontend:**
   ```bash
   cd ../dashboard-app
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite indique).

## Uso

1. **Registrar un nuevo usuario:** La primera vez, deberás crear un usuario. Puedes hacerlo a través de la API con una herramienta como Postman o Insomnia, o puedes modificar temporalmente el frontend para añadir una página de registro.

2. **Iniciar sesión:** Usa las credenciales del usuario que has creado.

3. **Explorar las diferentes secciones:**
    - **Dashboard:** Vista general del estado del portafolio.
    - **Clients:** Gestionar clientes.
    - **Projects:** Gestionar proyectos de financiamiento.
    - **Portfolio:** Gestionar los activos del portafolio.
    - **Configuración:** Establecer los parámetros globales de la aplicación.
