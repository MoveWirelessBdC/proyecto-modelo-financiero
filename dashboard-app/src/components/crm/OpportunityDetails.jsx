
// dashboard-app/src/components/crm/OpportunityDetails.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const OpportunityDetails = ({ opportunity, onUpdate }) => {
    const [formData, setFormData] = useState(opportunity);
    const [allUsers, setAllUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        // Cuando la oportunidad cambia, actualizamos el formulario
        // y nos aseguramos de que la fecha está en formato YYYY-MM-DD para el input
        const closeDate = opportunity.close_date ? new Date(opportunity.close_date).toISOString().split('T')[0] : '';
        setFormData({ ...opportunity, close_date: closeDate });

        // Cargar todos los usuarios para poder asignarlos
        api.get('/users').then(res => setAllUsers(res.data)).catch(err => console.error("Failed to load users", err));
    }, [opportunity]);

    const handleFormChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFormSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            await api.put(`/opportunities/${opportunity.id}`, formData);
            onUpdate(); // Esto debería refrescar los datos y cerrar el modal
        } catch (err) {
            setError('No se pudieron guardar los cambios.');
            console.error(err);
        }
    };

    const handleAssignMember = async (userId) => {
        if (!userId) return;
        try {
            await api.post(`/opportunities/${opportunity.id}/members`, { userId });
            onUpdate(); // Refrescar para ver al nuevo miembro
        } catch (err) {
            console.error("Failed to assign member", err);
            setError('Error al asignar miembro.');
        }
    };

    const handleUnassignMember = async (userId) => {
        try {
            await api.delete(`/opportunities/${opportunity.id}/members/${userId}`);
            onUpdate(); // Refrescar para ver que el miembro fue removido
        } catch (err) {
            console.error("Failed to unassign member", err);
            setError('Error al des-asignar miembro.');
        }
    };

    // Filtrar usuarios que aún no están asignados para mostrarlos en el dropdown
    const unassignedUsers = allUsers.filter(user => 
        !opportunity.members.some(member => member.id === user.id)
    );

    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Columna Principal: Formulario de Detalles */}
            <div className="md:col-span-2">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className={labelClass}>Nombre de la Oportunidad</label>
                        <input type="text" name="name" value={formData.name} onChange={handleFormChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="description" className={labelClass}>Descripción</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleFormChange} rows="4" className={inputClass}></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="potential_amount" className={labelClass}>Monto Potencial ($)</label>
                            <input type="number" name="potential_amount" value={formData.potential_amount || ''} onChange={handleFormChange} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="close_date" className={labelClass}>Fecha de Cierre Estimada</label>
                            <input type="date" name="close_date" value={formData.close_date} onChange={handleFormChange} className={inputClass} />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">Guardar Cambios</button>
                    </div>
                </form>
            </div>

            {/* Columna Derecha: Miembros y Acciones */}
            <div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Miembros Asignados</h4>
                    <ul className="space-y-2">
                        {opportunity.members.map(member => (
                            <li key={member.id} className="flex justify-between items-center text-sm">
                                <span>{member.nombre_completo}</span>
                                <button onClick={() => handleUnassignMember(member.id)} className="text-red-500 hover:text-red-700">×</button>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4">
                        <select onChange={(e) => handleAssignMember(e.target.value)} value="" className={inputClass}>
                            <option value="" disabled>Asignar miembro...</option>
                            {unassignedUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.nombre_completo}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OpportunityDetails;
