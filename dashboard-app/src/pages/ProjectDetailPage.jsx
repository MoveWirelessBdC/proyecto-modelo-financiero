// dashboard-app/src/pages/ProjectDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

const ProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [clients, setClients] = useState([]);
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editedProject, setEditedProject] = useState({});
    const [saving, setSaving] = useState(false);

    const fetchProjectDetails = useCallback(async () => {
        try {
            setLoading(true);
            const [projectResponse, clientsResponse, opportunitiesResponse] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get('/clients'),
                api.get('/opportunities')
            ]);
            
            setProject(projectResponse.data.project);
            setSchedule(projectResponse.data.schedule);
            setClients(clientsResponse.data);
            setOpportunities(opportunitiesResponse.data);
            setEditedProject(projectResponse.data.project);
        } catch (err) {
            setError('No se pudieron cargar los detalles del proyecto.');
            console.error('Error fetching project details:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProjectDetails();
    }, [fetchProjectDetails]);

    const handlePaymentStatus = async (paymentId, newStatus) => {
        try {
            await api.put(`/projects/${id}/payments/${paymentId}`, { status: newStatus });
            fetchProjectDetails();
        } catch (err) {
            alert('Error al actualizar el estado del pago.');
            console.error('Error al actualizar el estado del pago.', err);
        }
    };

    const handleSaveProject = async () => {
        setSaving(true);
        try {
            await api.put(`/projects/${id}`, editedProject);
            setProject(editedProject);
            setEditMode(false);
        } catch (err) {
            alert('Error al guardar los cambios del proyecto.');
            console.error('Error saving project:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedProject(project);
        setEditMode(false);
    };

    const handleInputChange = (field, value) => {
        setEditedProject(prev => ({ ...prev, [field]: value }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'activo':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'completed':
            case 'completado':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'pending':
            case 'pendiente':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'pagado':
                return 'text-green-700 bg-green-100 border-green-300';
            case 'pending':
            case 'pendiente':
                return 'text-yellow-700 bg-yellow-100 border-yellow-300';
            case 'overdue':
            case 'vencido':
                return 'text-red-700 bg-red-100 border-red-300';
            default:
                return 'text-gray-700 bg-gray-100 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="glass-card p-8 rounded-2xl">
                    <div className="text-center text-gray-600">Cargando detalles del proyecto...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="glass-card p-8 rounded-2xl border-l-4 border-red-500">
                    <div className="text-center text-red-600">{error}</div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="glass-card p-8 rounded-2xl">
                    <div className="text-center text-gray-600">Proyecto no encontrado.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header con navegación y acciones */}
                <div className="glass-card p-6 rounded-2xl shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/projects')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Volver a Proyectos
                            </button>
                            <div className="h-6 border-l border-gray-300"></div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                {editMode ? 'Editando Proyecto' : 'Detalle del Proyecto'}
                            </h1>
                        </div>
                        <div className="flex gap-3 mt-4 md:mt-0">
                            {!editMode ? (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Editar Proyecto
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveProject}
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información del proyecto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Descripción */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                            {editMode ? (
                                <textarea
                                    value={editedProject.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={3}
                                    placeholder="Descripción del proyecto..."
                                />
                            ) : (
                                <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                                    {project.description || 'Sin descripción'}
                                </div>
                            )}
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                            {editMode ? (
                                <select
                                    value={editedProject.status || 'active'}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="active">Activo</option>
                                    <option value="pending">Pendiente</option>
                                    <option value="completed">Completado</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            ) : (
                                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                                    {project.status || 'Activo'}
                                </div>
                            )}
                        </div>

                        {/* Cliente */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                            {editMode ? (
                                <select
                                    value={editedProject.client_id || ''}
                                    onChange={(e) => handleInputChange('client_id', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="bg-gray-50 px-4 py-3 rounded-lg border font-medium">
                                    {project.client_name}
                                </div>
                            )}
                        </div>

                        {/* Monto */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Monto Financiado</label>
                            <div className="bg-gray-50 px-4 py-3 rounded-lg border font-bold text-lg text-green-600">
                                {formatCurrency(project.amount)}
                            </div>
                        </div>

                        {/* Plazo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Plazo</label>
                            <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                                {project.term_months} meses
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de Amortización */}
                <div className="glass-card p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Cronograma de Pagos</h2>
                        <div className="text-sm text-gray-600">
                            Total de cuotas: {schedule.length}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Mes</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Cuota</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Principal</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Interés</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Balance</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((row, index) => (
                                    <tr key={row.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                    }`}>
                                        <td className="py-4 px-4 font-medium text-gray-800">{row.month_number}</td>
                                        <td className="py-4 px-4 text-gray-600">
                                            {new Date(row.payment_date).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="py-4 px-4 text-right font-medium">
                                            {formatCurrency(parseFloat(row.monthly_payment))}
                                        </td>
                                        <td className="py-4 px-4 text-right text-gray-600">
                                            {formatCurrency(parseFloat(row.principal))}
                                        </td>
                                        <td className="py-4 px-4 text-right text-gray-600">
                                            {formatCurrency(parseFloat(row.interest))}
                                        </td>
                                        <td className="py-4 px-4 text-right font-medium">
                                            {formatCurrency(parseFloat(row.remaining_balance))}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(row.status)}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {row.status === 'Pending' && (
                                                <button
                                                    onClick={() => handlePaymentStatus(row.id, 'Paid')}
                                                    className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors"
                                                >
                                                    Marcar Pagado
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Panel de Conectividad CRM */}
                <div className="glass-card p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Conectividad CRM</h2>
                        <div className="text-sm text-gray-600">
                            Cliente: {project.client_name}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Oportunidades Relacionadas */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">Oportunidades del Cliente</h3>
                                <button 
                                    onClick={() => {/* TODO: Modal para crear oportunidad */}}
                                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                                >
                                    + Nueva Oportunidad
                                </button>
                            </div>
                            
                            {opportunities.filter(opp => opp.client_id === project.client_id).length > 0 ? (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {opportunities
                                        .filter(opp => opp.client_id === project.client_id)
                                        .map(opportunity => (
                                            <div key={opportunity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-800 mb-1">{opportunity.name}</h4>
                                                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                                                                {opportunity.stage_name || 'Sin etapa'}
                                                            </span>
                                                            {opportunity.potential_amount && (
                                                                <span className="text-green-600 font-medium">
                                                                    {formatCurrency(parseFloat(opportunity.potential_amount))}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Responsable: {opportunity.owner_name || 'No asignado'}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button
                                                            onClick={() => window.open(`/opportunities/${opportunity.id}`, '_blank')}
                                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                                            title="Ver oportunidad"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Progress checklist si existe */}
                                                {opportunity.checklist_progress && opportunity.checklist_progress.total > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="flex items-center justify-between text-xs text-gray-600">
                                                            <span>Checklist</span>
                                                            <span>{opportunity.checklist_progress.completed}/{opportunity.checklist_progress.total}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                            <div 
                                                                className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                                                                style={{ 
                                                                    width: `${(opportunity.checklist_progress.completed / opportunity.checklist_progress.total) * 100}%` 
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    }
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="text-4xl mb-3">🔍</div>
                                    <p className="text-sm">No hay oportunidades activas para este cliente</p>
                                    <p className="text-xs mt-1">Puedes crear una nueva oportunidad relacionada al proyecto</p>
                                </div>
                            )}
                        </div>

                        {/* Panel de Acciones CRM */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Acciones de Integración</h3>
                            
                            <div className="space-y-4">
                                {/* Crear Oportunidad desde Proyecto */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-800 mb-2">Crear Oportunidad Relacionada</h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Genera una nueva oportunidad en el CRM basada en este proyecto para dar seguimiento comercial.
                                    </p>
                                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                                        Crear Oportunidad CRM
                                    </button>
                                </div>

                                {/* Sincronizar Status */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-800 mb-2">Sincronización de Estado</h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Mantén el estado del proyecto sincronizado con las oportunidades relacionadas en el CRM.
                                    </p>
                                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                        Sincronizar Estado
                                    </button>
                                </div>

                                {/* Generar Reportes */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-800 mb-2">Reportes Integrados</h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Genera reportes que combinen datos del proyecto con información del CRM.
                                    </p>
                                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm">
                                        Generar Reporte
                                    </button>
                                </div>
                            </div>

                            {/* Stats de conectividad */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-purple-600">
                                            {opportunities.filter(opp => opp.client_id === project.client_id).length}
                                        </div>
                                        <div className="text-xs text-gray-600">Oportunidades</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {opportunities
                                                .filter(opp => opp.client_id === project.client_id)
                                                .reduce((total, opp) => total + (opp.checklist_progress?.total || 0), 0)
                                            }
                                        </div>
                                        <div className="text-xs text-gray-600">Tareas CRM</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center gap-3">
                            <div className="text-purple-600 text-lg">💡</div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 mb-1">Conectividad Inteligente</h4>
                                <p className="text-xs text-gray-600">
                                    Esta funcionalidad conecta automáticamente tu proyecto financiero con las oportunidades comerciales del CRM, 
                                    proporcionando una vista completa del ciclo de vida del cliente desde la prospección hasta el financiamiento.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailPage;