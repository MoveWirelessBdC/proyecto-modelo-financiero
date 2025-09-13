// dashboard-app/src/pages/ClientsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estados para el formulario de nuevo cliente
    const [name, setName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [formError, setFormError] = useState('');

    // Función para obtener la lista de clientes del backend
    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/clients');
            setClients(response.data);
        } catch (err) {
            setError('No se pudo cargar la lista de clientes.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // useEffect para llamar a fetchClients cuando el componente se carga
    useEffect(() => {
        fetchClients();
    }, []);

    // Función para manejar el envío del formulario de nuevo cliente
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!name) {
            setFormError('El nombre es obligatorio.');
            return;
        }

        try {
            await api.post('/clients', {
                name: name,
                contact_info: contactInfo
            });

            // Limpiar el formulario y recargar la lista de clientes
            setName('');
            setContactInfo('');
            fetchClients(); // ¡Importante para ver el nuevo cliente en la lista!

        } catch (err) {
            setFormError('Error al crear el cliente.');
            console.error(err);
        }
    };

    if (loading) return <h1>Cargando clientes...</h1>;
    if (error) return <h1 style={{ color: 'red' }}>{error}</h1>;

    return (
        <div>
            <h1>Gestión de Clientes</h1>

            {/* Formulario para añadir nuevo cliente */}
            <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>Añadir Nuevo Cliente</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Nombre:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Información de Contacto:</label>
                        <input
                            type="text"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    {formError && <p style={{ color: 'red' }}>{formError}</p>}
                    <button type="submit" style={{ padding: '10px 15px' }}>Crear Cliente</button>
                </form>
            </div>

            {/* Tabla de clientes existentes */}
            <h3>Lista de Clientes</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #333' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Contacto</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map(client => (
                        <tr key={client.id} style={{ borderBottom: '1p`x solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{client.id}</td>
                            <td style={{ padding: '10px' }}>{client.name}</td>
                            <td style={{ padding: '10px' }}>{client.contact_info}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClientsPage;