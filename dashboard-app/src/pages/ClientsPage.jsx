// dashboard-app/src/pages/ClientsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [clientStats, setClientStats] = useState({ total: 0, activeProjects: 0, totalValue: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
            
            // Calcular estadísticas básicas
            setClientStats({
                total: response.data.length,
                activeProjects: 0, // Se puede obtener del backend más adelante
                totalValue: 0 // Se puede obtener del backend más adelante
            });
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
        setSubmitting(true);

        if (!name.trim()) {
            setFormError('El nombre es obligatorio.');
            setSubmitting(false);
            return;
        }

        try {
            await api.post('/clients', {
                name: name.trim(),
                contact_info: contactInfo.trim()
            });

            // Limpiar el formulario y recargar la lista de clientes
            setName('');
            setContactInfo('');
            setShowForm(false);
            fetchClients();

        } catch (err) {
            setFormError('Error al crear el cliente.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    // Estados de loading y error
    if (loading) {
        return (
            <div className="glass-card p-8 text-center">
                <div className="text-lg text-gray-600">Cargando clientes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-8 border-red-200">
                <div className="text-red-700 text-center">{error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Principal */}
            <div className="glass-card p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-light text-gray-900 mb-2">Gestión de Clientes</h1>
                        <p className="text-gray-600">Administra tu cartera de clientes y relaciones comerciales</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        {showForm ? 'Cancelar' : 'Nuevo Cliente'}
                    </button>
                </div>

                {/* Métricas Clave */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Total de Clientes</div>
                        <div className="text-2xl font-light text-gray-900">{clientStats.total}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Proyectos Activos</div>
                        <div className="text-2xl font-light text-gray-900">{clientStats.activeProjects}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Valor Total Cartera</div>
                        <div className="text-2xl font-light text-gray-900">
                            ${clientStats.totalValue.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulario de Creación */}
            {showForm && (
                <div className="glass-card p-6">
                    <h2 className="text-lg font-light text-gray-900 mb-4">Nuevo Cliente</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm text-gray-700 mb-2">
                                    Nombre del Cliente *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-colors"
                                    placeholder="Empresa ABC S.A."
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-2">
                                    Información de Contacto
                                </label>
                                <input
                                    type="text"
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-colors"
                                    placeholder="contacto@empresa.com, +58 412-123-4567"
                                    disabled={submitting}
                                />
                            </div>
                        </div>
                        
                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {formError}
                            </div>
                        )}
                        
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                            >
                                {submitting ? 'Creando...' : 'Crear Cliente'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de Clientes */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-light text-gray-900 mb-4">Cartera de Clientes</h2>
                
                {clients.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">No hay clientes registrados</div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="text-gray-600 hover:text-gray-800 underline transition-colors"
                        >
                            Crear tu primer cliente
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Cliente</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Contacto</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Propietario</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client, index) => (
                                    <tr 
                                        key={client.id} 
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                        }`}
                                    >
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-gray-900">{client.name}</div>
                                            <div className="text-sm text-gray-500">ID: {client.id}</div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {client.contact_info || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {client.owner_name || 'N/A'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button className="text-gray-600 hover:text-gray-800 text-sm underline transition-colors">
                                                Ver detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientsPage;
