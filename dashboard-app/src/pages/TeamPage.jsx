// dashboard-app/src/pages/TeamPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';

const TeamPage = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [newUser, setNewUser] = useState({ nombre_completo: '', email: '', password: '', rol_id: '' });

    const fetchData = async () => {
        const usersRes = await api.get('/users');
        const rolesRes = await api.get('/roles');
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
        if (rolesRes.data.length > 0) {
            setNewUser(prev => ({ ...prev, rol_id: rolesRes.data[0].id }));
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = e => setNewUser({ ...newUser, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await api.post('/users', newUser);
            fetchData(); // Recargar la lista de usuarios
        } catch (error) {
            alert(error.response?.data?.message || 'Error al crear usuario.');
        }
    };

    return (
        <div>
            <h1>Gestión de Equipo</h1>
            {/* Formulario para añadir nuevo usuario */}
            <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>Añadir Nuevo Miembro</h3>
                <form onSubmit={handleSubmit}>
                    <input name="nombre_completo" value={newUser.nombre_completo} onChange={handleInputChange} placeholder="Nombre Completo" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' }}/>
                    <input type="email" name="email" value={newUser.email} onChange={handleInputChange} placeholder="Email" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' }}/>
                    <input type="password" name="password" value={newUser.password} onChange={handleInputChange} placeholder="Contraseña" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' }}/>
                    <select name="rol_id" value={newUser.rol_id} onChange={handleInputChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' }}>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.nombre_rol}</option>
                        ))}
                    </select>
                    <button type="submit" style={{ padding: '10px 15px' }}>Crear Usuario</button>
                </form>
            </div>

            {/* Tabla de usuarios existentes */}
            <h3>Miembros del Equipo</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #333' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Rol</th>
                  </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{user.id}</td>
                            <td style={{ padding: '10px' }}>{user.nombre_completo}</td>
                            <td style={{ padding: '10px' }}>{user.email}</td>
                            <td style={{ padding: '10px' }}>{user.nombre_rol}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TeamPage;
