// dashboard-app/src/pages/ClientDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

const ClientDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clientData, setClientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchClientDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/clients/${id}/details`);
            setClientData(response.data);
        } catch (err) {
            setError('No se pudo cargar los detalles del cliente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchClientDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="glass-card p-8 text-center">
                <div className="text-lg text-gray-600">Cargando detalles del cliente...</div>
            </div>
        );
    }

    if (error || !clientData) {
        return (
            <div className="glass-card p-8 border-red-200">
                <div className="text-red-700 text-center">{error}</div>
                <div className="text-center mt-4">
                    <button
                        onClick={() => navigate('/clients')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Volver a Clientes
                    </button>
                </div>
            </div>
        );
    }

    const { client, projects, opportunities } = clientData;

    return (
        <div className="space-y-6">
            {/* Header con información del cliente */}
            <div className="glass-card p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <button
                                onClick={() => navigate('/clients')}
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                ← Volver
                            </button>
                            <h1 className="text-2xl font-light text-gray-900">{client.name}</h1>
                        </div>
                        <p className="text-gray-600">Perfil completo del cliente y actividades relacionadas</p>
                    </div>
                </div>

                {/* Información básica del cliente */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">ID del Cliente</div>
                        <div className="text-lg font-light text-gray-900">{client.id}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Contacto</div>
                        <div className="text-lg font-light text-gray-900">
                            {client.contact_info || 'Sin información'}
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Propietario</div>
                        <div className="text-lg font-light text-gray-900">
                            {client.owner_name || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Estadísticas del cliente */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-blue-600 mb-1">Proyectos Activos</div>
                        <div className="text-2xl font-light text-blue-900">
                            {projects.filter(p => p.status === 'Activo').length}
                        </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-green-600 mb-1">Valor Total Proyectos</div>
                        <div className="text-2xl font-light text-green-900">
                            ${projects.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-purple-600 mb-1">Oportunidades</div>
                        <div className="text-2xl font-light text-purple-900">{opportunities.length}</div>
                    </div>
                </div>
            </div>

            {/* Proyectos del cliente */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-light text-gray-900 mb-4">Proyectos ({projects.length})</h2>
                {projects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No hay proyectos asociados a este cliente
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Proyecto</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Monto</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Estado</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Fecha Inicio</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project, index) => (
                                    <tr 
                                        key={project.id} 
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                        }`}
                                    >
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-gray-900">{project.description}</div>
                                            <div className="text-sm text-gray-500">ID: {project.id}</div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            ${parseFloat(project.amount || 0).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                project.status === 'Activo' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {project.status || 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                to={`/projects/${project.id}`}
                                                className="text-gray-600 hover:text-gray-800 text-sm underline transition-colors"
                                            >
                                                Ver proyecto
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Oportunidades del cliente */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-light text-gray-900 mb-4">Oportunidades ({opportunities.length})</h2>
                {opportunities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No hay oportunidades asociadas a este cliente
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Oportunidad</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Valor Potencial</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Etapa</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Propietario</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {opportunities.map((opportunity, index) => (
                                    <tr 
                                        key={opportunity.id} 
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                        }`}
                                    >
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-gray-900">{opportunity.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {opportunity.description ? opportunity.description.substring(0, 60) + '...' : 'Sin descripción'}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {opportunity.potential_amount 
                                                ? `$${parseFloat(opportunity.potential_amount).toLocaleString()}`
                                                : '-'
                                            }
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {opportunity.stage_name || 'Sin etapa'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {opportunity.owner_name || 'N/A'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                to={`/opportunities/${opportunity.id}`}
                                                className="text-gray-600 hover:text-gray-800 text-sm underline transition-colors"
                                            >
                                                Ver oportunidad
                                            </Link>
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

export default ClientDetailPage;