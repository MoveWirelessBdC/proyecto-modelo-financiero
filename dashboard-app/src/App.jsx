// dashboard-app/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ClientsPage from './pages/ClientsPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';

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
                                    <Route path="/projects" element={<ProjectsPage />} />
                                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                                    {/* 2. CONECTAMOS LA RUTA AL NUEVO COMPONENTE */}
                                    <Route path="/portfolio" element={<PortfolioPage />} />
                                    <Route path="/config" element={<h1>Configuración</h1>} />
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