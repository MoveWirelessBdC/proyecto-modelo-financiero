// dashboard-app/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth'; // Corregido: Importar desde el hook personalizado
import Login from './components/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ClientsPage from './pages/ClientsPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';
import TeamPage from './pages/TeamPage.jsx'; // <-- IMPORTAMOS LA NUEVA PÁGINA
import ConfigurationPage from './pages/ConfigurationPage'; // <-- 1. IMPORTAMOS LA NUEVA PÁGINA
import CrmPipelinePage from './pages/CrmPipelinePage'; // <-- IMPORTAMOS LA NUEVA PÁGINA

function App() {
    const { user } = useAuth();
    return (
        <Router>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
                <Route 
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Routes>
                                    <Route path="/dashboard" element={<DashboardPage />} />
                                    <Route path="/clients" element={<ClientsPage />} />
                                    <Route path="/crm" element={<CrmPipelinePage />} />
                                    <Route path="/projects" element={<ProjectsPage />} />
                                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                                    <Route path="/portfolio" element={<PortfolioPage />} />
                                    {/* 2. CONECTAMOS LA RUTA AL NUEVO COMPONENTE */}
                                    <Route path="/config" element={<ConfigurationPage />} />
                                    <Route path="/team" element={<TeamPage />} />
                                    <Route path="/" element={<Navigate to="/dashboard" />} />
                                </Routes>
                            </MainLayout>
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
}
export default App;