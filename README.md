# Aplicación Web de Gestión de Portafolio y Financiamiento

Esta es una aplicación web completa para la gestión activa de un negocio de financiamiento apalancado. La aplicación permite al usuario (el gestor) administrar todo el ciclo de vida de la operación: desde la configuración de los parámetros del negocio y la cartera de inversión, hasta la creación y seguimiento de préstamos individuales para cada cliente.

## Arquitectura

La aplicación consta de dos partes principales:

-   **Frontend:** Una aplicación de una sola página (SPA) construida con React y Vite. Se encuentra en el directorio `dashboard-app`.
-   **Backend:** Una API RESTful construida con Node.js y Express. Se encuentra en el directorio `server`.
-   **Base de Datos:** PostgreSQL, gestionada a través de Docker para facilitar la configuración.
-   **Procesos en Segundo Plano:** Un worker de Node.js para tareas programadas, como la actualización de datos de mercado.

## Características Principales

-   **Autenticación y Autorización:** Sistema de usuarios con roles y permisos.
-   **Gestión de Clientes:** Creación, edición y visualización de clientes.
-   **Gestión de Proyectos de Financiamiento:** Creación de préstamos con cálculo de tablas de amortización.
-   **Gestión de Portafolio de Colateral:** Administración de activos que respaldan la operación.
-   **Dashboard Dinámico:** Visualización en tiempo real de los KPIs más importantes del negocio, como el Loan-to-Value (LTV).
-   **Actualización Automática de Datos de Mercado:** Un worker actualiza periódicamente el valor de los activos del portafolio utilizando la API de FinancialModelingPrep.

## Cómo Empezar

Sigue estos pasos para poner en marcha la aplicación en tu entorno local.

### Prerrequisitos

-   **Node.js** (v16 o superior)
-   **Docker** y **Docker Compose**

### 1. Clonar el Repositorio

```bash
git clone https://github.com/MoveWirelessBdC/proyecto-modelo-financiero.git
cd proyecto-modelo-financiero
```

### 2. Configurar el Backend

Navega al directorio del servidor y crea tu propio archivo de entorno a partir del ejemplo proporcionado.

```bash
cd server
cp .env.example .env
```

**Importante:** Para la actualización de datos de mercado, debes obtener una API Key gratuita de [FinancialModelingPrep](https://site.financialmodelingprep.com/developer/) y añadirla a tu archivo `.env`:

```
FMP_API_KEY=TU_API_KEY_AQUI
```

### 3. Instalar Dependencias

Instala las dependencias tanto para el backend como para el frontend.

```bash
# Desde la carpeta /server
npm install

# Navega a la carpeta del frontend e instala sus dependencias
cd ../dashboard-app
npm install
```

### 4. Iniciar la Base de Datos

Regresa a la raíz del proyecto y utiliza Docker Compose para iniciar el contenedor de la base de datos en segundo plano.

```bash
cd ..
docker-compose up -d
```

Espera un momento a que la base de datos se inicie por completo.

### 5. Inicializar la Base de Datos y Crear Usuario Admin

Una vez que la base de datos esté en funcionamiento, ejecuta el script de inicialización desde la carpeta del servidor. Este comando creará las tablas necesarias y un usuario administrador por defecto.

```bash
cd server
npm run db:init
```

### 6. Ejecutar la Aplicación

Ahora puedes iniciar ambos servidores. Se recomienda usar dos terminales separadas para esto.

**Terminal 1: Iniciar el Backend**

```bash
# Desde la carpeta /server
npm start
```
El servidor se ejecutará en `http://localhost:3001`.

**Terminal 2: Iniciar el Frontend**

```bash
# Desde la carpeta /dashboard-app
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

## Uso

Una vez que la aplicación esté en funcionamiento, puedes iniciar sesión con las credenciales del administrador creado automáticamente:

-   **Usuario:** `admin@app.com`
-   **Contraseña:** `supersecretpassword`

Desde allí, podrás explorar las diferentes secciones:

-   **Dashboard:** Vista general del estado del portafolio.
-   **Clients:** Gestionar clientes.
-   **Projects:** Gestionar proyectos de financiamiento.
-   **Portfolio:** Gestionar los activos del portafolio.
-   **Configuración:** Establecer los parámetros globales de la aplicación.
