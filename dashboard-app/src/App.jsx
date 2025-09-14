// dashboard-app/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- ESTA ES LA LÍNEA QUE FALTABA ---
import { useAuth } from './context/AuthContext'; 

import Login from './components/Login';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

const MainLayout = ({ children }) => (
    <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '20px' }}>
            {children}
        </main>
    </div>
);

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
                                <Route path="/portfolio" element={<h1>Portafolio</h1>} />
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