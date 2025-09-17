// dashboard-app/src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Define todos los enlaces de navegación y los roles que pueden verlos
const navLinks = [
    { to: "/dashboard", label: "Dashboard", roles: ['Owner', 'Admin', 'Manager', 'Observer'] },
    { to: "/projects", label: "Proyectos", roles: ['Owner', 'Admin', 'Manager', 'Team Member', 'Observer'] },
    { to: "/clients", label: "Clientes", roles: ['Owner', 'Admin', 'Manager', 'Team Member', 'Observer'] },
    { to: "/crm", label: "CRM Pipeline", roles: ['Owner', 'Admin', 'Manager', 'Team Member'] },
    { to: "/portfolio", label: "Portafolio", roles: ['Owner', 'Admin', 'Manager', 'Observer'] },
    { to: "/config", label: "Configuración", roles: ['Owner', 'Admin'] },
    { to: "/team", label: "Gestión de Equipo", roles: ['Owner', 'Admin', 'Manager'] }
];

const Sidebar = () => {
    const { user, logout } = useAuth(); // Obtener el usuario del contexto

    const linkStyle = "block py-2 px-3 rounded-md text-gray-600 hover:bg-gray-100";
    const activeLinkStyle = {
        fontWeight: '600',
        color: '#333'
    };

    // Si el usuario existe, filtra los enlaces basados en su rol. Si no, la lista estará vacía.
    const availableLinks = user ? navLinks.filter(link => link.roles.includes(user.rol)) : [];

    return (
        <aside className="w-64 bg-white p-6 border-r border-gray-200 h-screen flex flex-col justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-10">FinanTech</h1>
                <nav>
                    <ul className="space-y-2">
                        {availableLinks.map(link => (
                            <li key={link.to}>
                                <NavLink 
                                    to={link.to} 
                                    style={({ isActive }) => isActive ? activeLinkStyle : undefined} 
                                    className={linkStyle}
                                >
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
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