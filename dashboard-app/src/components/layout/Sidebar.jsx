// dashboard-app/src/components/layout/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    return (
        <div style={{ width: '250px', background: '#f4f4f4', padding: '20px', height: '100vh' }}>
            <h2>FinanTech</h2>
            <nav>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '10px' }}><Link to="/dashboard">Dashboard</Link></li>
                    <li style={{ marginBottom: '10px' }}><Link to="/projects">Proyectos</Link></li>
                    <li style={{ marginBottom: '10px' }}><Link to="/clients">Clientes</Link></li>
                    <li style={{ marginBottom: '10px' }}><Link to="/portfolio">Portafolio</Link></li>
                    <li style={{ marginBottom: '10px' }}><Link to="/config">Configuración</Link></li>
                </ul>
            </nav>
            <button onClick={logout} style={{ marginTop: '20px' }}>Cerrar Sesión</button>
        </div>
    );
};

export default Sidebar;