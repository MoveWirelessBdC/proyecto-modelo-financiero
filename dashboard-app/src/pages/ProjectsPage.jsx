// dashboard-app/src/pages/ProjectsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newProject, setNewProject] = useState({
        client_id: '',
        description: 'Financiamiento de Equipo Tecnológico',
        amount: '',
        start_date: new Date().toISOString().split('T')[0],
        interest_rate: '25',
        insurance_cost: '0',
        term_months: '12',
        sales_commission: '0'
    });

    const fetchData = useCallback(async () => {
        try {
            setError('');
            const [projectsResponse, clientsResponse] = await Promise.all([
                api.get('/projects'),
                api.get('/clients')
            ]);
            setProjects(projectsResponse.data);
            setClients(clientsResponse.data);
            if (clientsResponse.data.length > 0 && !newProject.client_id) {
                setNewProject(prev => ({ ...prev, client_id: clientsResponse.data[0].id }));
            }
        } catch (err) {
            setError('No se pudo cargar la información de la página.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [newProject.client_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProject(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setCreating(true);
        
        if (!newProject.client_id || !newProject.amount) {
            setFormError('Cliente y Monto son obligatorios.');
            setCreating(false);
            return;
        }
        
        try {
            await api.post('/projects', newProject);
            await fetchData();
            setShowForm(false);
            // Reset form
            setNewProject({
                client_id: clients[0]?.id || '',
                description: 'Financiamiento de Equipo Tecnológico',
                amount: '',
                start_date: new Date().toISOString().split('T')[0],
                interest_rate: '25',
                insurance_cost: '0',
                term_months: '12',
                sales_commission: '0'
            });
        } catch (err) {
            setFormError('Error al crear el proyecto.');
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getProjectStatusColor = (project) => {
        const status = project.status?.toLowerCase();
        switch (status) {
            case 'active':
            case 'activo':
                return 'bg-gray-100 text-gray-800';
            case 'completed':
            case 'completado':
                return 'bg-gray-200 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="glass-card p-8 rounded-2xl">
                    <div className="text-center text-gray-600">Cargando proyectos...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="glass-card p-8 rounded-2xl border-l-4 border-red-400">
                    <div className="text-center text-red-600">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="glass-card p-6 rounded-2xl shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Proyectos</h1>
                            <p className="text-gray-600">Administra tu cartera de financiamientos activos</p>
                        </div>
                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-800">{projects.length}</div>
                                    <div>Total Proyectos</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-800">
                                        {formatCurrency(projects.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0))}
                                    </div>
                                    <div>Valor Total Cartera</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                {showForm ? 'Cancelar' : 'Nuevo Proyecto'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Create Project Form */}
                {showForm && (
                    <div className="glass-card p-6 rounded-2xl shadow-lg border-l-4 border-gray-600">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Crear Nuevo Proyecto</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                                    <select
                                        name="client_id"
                                        value={newProject.client_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white"
                                        required
                                    >
                                        <option value="">Seleccionar cliente...</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Monto a Financiar</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={newProject.amount}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        placeholder="$0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tasa de Interés (%)</label>
                                    <input
                                        type="number"
                                        name="interest_rate"
                                        value={newProject.interest_rate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Plazo (Meses)</label>
                                    <input
                                        type="number"
                                        name="term_months"
                                        value={newProject.term_months}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        min="1"
                                        max="120"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={newProject.start_date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={newProject.description}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        placeholder="Descripción del proyecto..."
                                    />
                                </div>
                            </div>
                            
                            {formError && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600 text-sm">{formError}</p>
                                </div>
                            )}
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                                >
                                    {creating ? 'Creando...' : 'Crear Proyecto'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Projects Table */}
                <div className="glass-card p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Cartera de Proyectos</h2>
                        <div className="text-sm text-gray-600">
                            {projects.length} {projects.length === 1 ? 'proyecto' : 'proyectos'}
                        </div>
                    </div>

                    {projects.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Cliente</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-700">Monto</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Tasa</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Plazo</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Inicio</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Estado</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map((project, index) => (
                                        <tr 
                                            key={project.id} 
                                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                            }`}
                                        >
                                            <td className="py-4 px-6">
                                                <div>
                                                    <div className="font-medium text-gray-800">
                                                        {project.client_name}
                                                    </div>
                                                    <div className="text-sm text-gray-600 truncate max-w-xs">
                                                        {project.description}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="font-semibold text-gray-800">
                                                    {formatCurrency(parseFloat(project.amount))}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="text-gray-700">
                                                    {parseFloat(project.interest_rate).toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="text-gray-700">
                                                    {project.term_months}m
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="text-gray-600 text-sm">
                                                    {new Date(project.start_date).toLocaleDateString('es-ES')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project)}`}>
                                                    {project.status || 'Activo'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <Link
                                                    to={`/projects/${project.id}`}
                                                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors font-medium text-sm"
                                                >
                                                    Ver detalles
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-6xl text-gray-300 mb-4">📊</div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No hay proyectos activos</h3>
                            <p className="text-gray-600 mb-6">Comienza creando tu primer proyecto de financiamiento</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Crear Primer Proyecto
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;