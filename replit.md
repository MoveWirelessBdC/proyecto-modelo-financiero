# FinMod Pro - Plataforma de Gestión Financiera

## Visión y Propósito Estratégico

**FinMod Pro** es una plataforma integral de gestión para un modelo de negocio de **arbitraje de tasas de interés mediante apalancamiento**, diseñada para financiar la modernización tecnológica de PyMEs venezolanas.

### Modelo de Negocio
- **Problema**: PyMEs necesitan actualizar infraestructura tecnológica pero enfrentan escasez de financiamiento asequible
- **Solución**: Modelo de arbitraje usando capital propio como colateral de bajo riesgo para acceder a líneas de crédito de margen a tasas preferenciales
- **Estrategia**: Financiar equipos tecnológicos a tasas competitivas generando margen de interés neto robusto

### Propósito de la Herramienta
Transformar la complejidad del modelo de negocio en una ventaja competitiva sostenible mediante gestión de riesgo y operativa impecable. Es la plataforma operativa y de mitigación de riesgo que permite ejecutar la estrategia de manera segura, eficiente y escalable.

## Arquitectura del Sistema

**Aplicación Web SaaS**: Centralizada, Segura, Basada en Datos, Escalable

- **Frontend**: React con Vite (dashboard-app/) - Puerto 5000
- **Backend**: Node.js con Express (server/) - Puerto 3001  
- **Base de Datos**: PostgreSQL de Replit (reemplaza Docker)
- **Autenticación**: JWT con sistema de roles específicos del negocio

## Módulos del Sistema

### **Módulo 1: Dashboard Principal / Centro de Control - REDISEÑO AVANZADO**
**Objetivo**: Verdadero centro de control estratégico con tres zonas especializadas para visión completa del negocio

#### **Zona 1: Salud Financiera (Vista CEO/Financiera)**
*Parte superior del dashboard - KPIs vitales del negocio*

**Componentes**:
- **Medidor de LTV (Existente)**: RiskGauge del LTV - indicador de riesgo más crítico
- **KPIs Principales (Existentes)**: Tarjetas de Valor del Portafolio y Deuda Total  
- **🆕 NUEVO - Indicador de Flujo de Caja Operativo**:
  * **Fórmula**: `(Ingresos por Intereses de Clientes) - (Gastos por Intereses del Bróker) - (Costos Operativos Mensuales)`
  * **Propósito**: Muestra si el núcleo del negocio está generando o consumiendo efectivo

#### **Zona 2: Rendimiento del Portafolio (Vista Tesorero/Inversor)**  
*Enfoque en el rendimiento del colateral que respalda toda la operación*

**Componentes**:
- **🆕 NUEVO - Gráfico de Rendimiento de Activos (Líneas)**:
  * **Visualización**: Evolución del valor de mercado de activos de inversión a lo largo del tiempo
  * **Ejes**: X=Tiempo (30/90/365 días), Y=Valor de Mercado ($)
  * **Series**: Línea por cada activo + línea total del portafolio
  * **Requisito**: Registro histórico de valores en `asset_value_history`

- **🆕 NUEVO - Composición del Portafolio (Gráfico Pastel)**:
  * **Visualización**: Distribución porcentual de la cartera por activo
  * **Propósito**: Evaluación de diversificación y riesgo de concentración

#### **Zona 3: Rendimiento Comercial (Vista Gerente Ventas)**
*Motor de crecimiento del negocio - desempeño del equipo comercial*

**Componentes**:
- **🆕 NUEVO - Embudo de Ventas (Funnel Chart)**:
  * **Etapas**: 
    1. Oportunidades Creadas ($)
    2. Pendientes de Aprobación ($)  
    3. Proyectos Ganados/Activos ($)
  * **Propósito**: Visibilidad del pipeline comercial y tasas de conversión
  * **Requisito**: Campo `status` en tabla `projects`

- **🆕 NUEVO - Proyectos Activos por Vendedor (Barras)**:
  * **Visualización**: Rendimiento individual por monto financiado ($)  
  * **Propósito**: Métricas de equipo, identificación de mejores vendedores

### **Requisitos Técnicos para Implementación**
1. **Modificaciones Base de Datos**:
   - Añadir campo `status` a tabla `projects` ('Oportunidad', 'Pendiente de Aprobación', 'Activo', 'Completado')
   - Crear tabla `asset_value_history` para valores históricos del portafolio

2. **Nuevos Endpoints Backend**:
   - `/api/portfolio/performance` - Datos de rendimiento histórico
   - `/api/sales/pipeline` - Datos del embudo comercial
   - `/api/dashboard/cashflow` - Cálculo de flujo de caja operativo

3. **Componentes Frontend**:
   - Usar Recharts para gráficos avanzados (líneas, pastel, embudo, barras)
   - Layout responsivo de tres zonas especializadas

### **Módulo 2: CRM Financiero (Clientes y Proyectos)**
**Objetivo**: Gestión del ciclo completo de relación con cliente y operaciones de financiamiento

**Componentes Clave**:
- Gestión CRUD completa de clientes
- Creación de proyectos con validaciones de negocio robustas
- Generación automática de tablas de amortización
- Registro de pagos con manejo de pagos parciales y sobrepagos

### **Módulo 3: Gestión de Colateral (Portafolio de Inversión)**
**Objetivo**: Administrar y valorar la cartera de activos que sirve como garantía para apalancamiento

**Componentes Clave**:
- Registro de activos de inversión (bonos, acciones, etc.)
- Actualización manual del valor de mercado para precisión del LTV
- Registro de transacciones del portafolio (inyecciones, reinversiones, liquidaciones)

### **Módulo 4: Configuración Global**
**Objetivo**: Externalizar variables y reglas de negocio para adaptación estratégica sin desarrollo adicional

**Componentes Clave**:
- Formularios para tasas de interés, umbrales de riesgo LTV, costos operativos
- Parámetros financieros clave configurables

### **Módulo 5: Gestión de Roles y Permisos**
**Objetivo**: Asegurar operación y proteger información sensible al escalar equipo

**Roles Definidos**:
- **Asesor Financiero/Admin**: Acceso total al sistema
- **Equipo Comercial**: Acceso limitado al CRM, creación de borradores para aprobación
- **Contable**: Solo lectura a datos financieros, funcionalidad de exportar reportes

## Lógica de Negocio Crítica

### **Flujo de Originación de Préstamos**
1. Vendedor crea oportunidad → Estado "Pendiente de Aprobación"
2. Asesor Financiero recibe notificación → Revisión contra políticas de riesgo
3. Aprobación/Rechazo → Activación del financiamiento

### **Flujo de Gestión de Pagos**
1. Registro de pago recibido a través de tabla de amortización
2. Sistema actualiza estado de cuota y saldo pendiente del préstamo

### **Flujo de Gestión de Riesgo (Lógica LTV) - CRÍTICO**
**"Piloto Automático" del Sistema**:
- Recálculo automático del LTV en cada pago o actualización del portafolio
- Determinación basada en umbrales (Crecimiento, Consolidación, Defensivo)
- Asignación automática del flujo de caja: reinversión vs. amortización de deuda de margen
- Alertas automáticas en caso de riesgo elevado

## Estado Actual del Sistema (Septiembre 24, 2025)

### Configuración Técnica Completada
- Entorno Replit configurado (reemplazando Docker PostgreSQL)
- Vite configurado para hosting Replit (allowedHosts: true, puerto 5000)
- API configurada para enrutamiento de dominios Replit
- Workflow combinado para frontend + backend
- Configuración de despliegue para objetivo autoscale
- Base de datos inicializada con usuario admin

### Credenciales por Defecto
- **Usuario**: admin@app.com
- **Contraseña**: supersecretpassword

## Estructura del Proyecto
```
/
├── dashboard-app/          # React frontend
│   ├── src/
│   │   ├── components/     # Componentes React por módulo
│   │   ├── pages/          # Páginas principales del sistema
│   │   ├── api/           # Configuración cliente API
│   │   └── context/       # Proveedores de contexto React
│   └── vite.config.js     # Configuración Vite (optimizada Replit)
├── server/                # Backend Node.js
│   ├── controllers/       # Controladores de rutas por módulo
│   ├── models/           # Modelos de base de datos
│   ├── routes/           # Rutas API organizadas por funcionalidad
│   ├── db/               # Utilidades de base de datos
│   └── .env              # Configuración de entorno
├── evaluacion.md          # Documento maestro del proyecto (NUEVO)
└── README.md             # Documentación técnica original
```

## Entorno de Desarrollo
- **Node.js 20** instalado vía módulos Replit
- **Base de datos PostgreSQL** provisionada vía Replit
- **Variables de entorno** configuradas para DATABASE_URL y JWT_SECRET
- **Configuraciones CORS y host** optimizadas para entorno proxy Replit

## Criterios de Éxito del Producto Final

### Para el Asesor Financiero
Herramienta con visibilidad total del riesgo (LTV) y rentabilidad en tiempo real para decisiones estratégicas basadas en datos.

### Para el Equipo Comercial
Herramienta ágil para gestión de clientes y oportunidades, liberándolos de carga administrativa para enfocarse en ventas.

### Para el Contable
Acceso fácil, centralizado y exportable a datos de pagos, amortizaciones e intereses para simplificar contabilidad y cumplimiento fiscal.

### Para los Inversionistas
Confianza de que su capital se gestiona con disciplina rigurosa mediante sistema propietario que mitiga activamente el riesgo inherente al modelo de negocio.

## Configuración de Despliegue
- **Objetivo**: Autoscale (aplicación web stateless)
- **Build**: Proceso de construcción React
- **Runtime**: Servicio combinado backend + frontend