// dashboard-app/src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    const linkStyle = "block py-2 px-3 rounded-md text-gray-600 hover:bg-gray-100";
    const activeLinkStyle = {
        fontWeight: '600',
        color: '#333'
    };

    return (
        <aside className="w-64 bg-white p-6 border-r border-gray-200 h-screen flex flex-col justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-10">FinanTech</h1>
                <nav>
                    <ul className="space-y-2">
                        <li><NavLink to="/dashboard" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className={linkStyle}>Dashboard</NavLink></li>
                        <li><NavLink to="/projects" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className={linkStyle}>Proyectos</NavLink></li>
                        <li><NavLink to="/clients" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className={linkStyle}>Clientes</NavLink></li>
                        <li><NavLink to="/crm" className={linkStyle} style={({isActive}) => isActive ? activeLinkStyle : undefined}>CRM Pipeline</NavLink></li>
                        <li><NavLink to="/portfolio" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className={linkStyle}>Portafolio</NavLink></li>
                        <li><NavLink to="/config" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className={linkStyle}>Configuración</NavLink></li>
                        <li><NavLink to="/team" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className={linkStyle}>Gestión de Equipo</NavLink></li>
                    </ul>
                </nav>
            </div>
            <button onClick={logout} className="w-full text-left py-2 px-3 rounded-md text-gray-600 hover:bg-gray-100">
                Cerrar Sesión
            </button>
        </aside>
    );
};

export default Sidebar;
