# Portfolio Management Dashboard - Replit Setup

## Overview
Full-stack portfolio and leveraged finance management application successfully configured for Replit environment.

**Purpose**: Web application for managing a leveraged finance business including client management, project tracking, portfolio monitoring, and CRM pipeline functionality.

**Current State**: Fully operational in Replit environment with PostgreSQL database, React frontend, and Node.js backend.

## Architecture
- **Frontend**: React with Vite (dashboard-app/) - Port 5000
- **Backend**: Node.js with Express (server/) - Port 3001  
- **Database**: Replit PostgreSQL (replaces Docker setup)
- **Authentication**: JWT-based with admin user created

## Recent Changes (September 24, 2025)
- Configured Replit environment setup replacing Docker PostgreSQL
- Updated Vite configuration for Replit hosting (allowedHosts: true, port 5000)
- Modified API configuration to work with Replit domain routing
- Set up combined workflow for frontend + backend
- Configured deployment for autoscale target
- Initialized database with admin user (admin@app.com / supersecretpassword)

## Default Credentials
- **Username**: admin@app.com
- **Password**: supersecretpassword

## Project Structure
```
/
├── dashboard-app/          # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── api/           # API client configuration
│   │   └── context/       # React context providers
│   └── vite.config.js     # Vite configuration (Replit optimized)
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── db/               # Database utilities
│   └── .env              # Environment configuration
└── README.md             # Original project documentation
```

## Environment Setup
- Node.js 20 installed via Replit modules
- PostgreSQL database provisioned via Replit
- Environment variables configured for DATABASE_URL and JWT_SECRET
- CORS and host configurations optimized for Replit proxy environment

## Key Features
- Client management
- Project/loan tracking with amortization schedules
- Portfolio asset management
- Real-time dashboard with KPIs
- CRM pipeline with drag-and-drop functionality
- User authentication and role management

## Deployment Configuration
- **Target**: Autoscale (stateless web application)
- **Build**: React build process
- **Runtime**: Combined backend + frontend serving