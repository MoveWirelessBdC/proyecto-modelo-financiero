
import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import RichTextEditor from '../common/RichTextEditor';

const OpportunityDetails = ({ opportunity, onUpdate, onSaveAndClose }) => {
    const [formData, setFormData] = useState(opportunity);
    const [allUsers, setAllUsers] = useState([]);
    const [allTags, setAllTags] = useState([]); // Estado para todas las etiquetas
    const [error, setError] = useState('');

    useEffect(() => {
        const closeDate = opportunity.close_date ? new Date(opportunity.close_date).toISOString().split('T')[0] : '';
        setFormData({ ...opportunity, close_date: closeDate });

        // Cargar usuarios y etiquetas
        api.get('/users').then(res => setAllUsers(res.data)).catch(err => console.error("Failed to load users", err));
        api.get('/tags').then(res => setAllTags(res.data)).catch(err => console.error("Failed to load tags", err));

    }, [opportunity]);

    const handleFormChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleDescriptionChange = (content) => {
        setFormData({ ...formData, description: content });
    };

    const handleFormSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            await api.put(`/opportunities/${opportunity.id}`, formData);
            onSaveAndClose();
        } catch (err) {
            setError('No se pudieron guardar los cambios.');
            console.error(err);
        }
    };

    // --- GESTIÓN DE MIEMBROS ---
    const handleAssignMember = async (userId) => {
        if (!userId) return;
        try {
            await api.post(`/opportunities/${opportunity.id}/members`, { userId });
            onUpdate();
        } catch (err) {
            setError('Error al asignar miembro.');
            console.error('Error al asignar miembro.', err);
        }
    };

    const handleUnassignMember = async (userId) => {
        try {
            await api.delete(`/opportunities/${opportunity.id}/members/${userId}`);
            onUpdate();
        } catch (err) {
            setError('Error al des-asignar miembro.');
            console.error('Error al des-asignar miembro.', err);
        }
    };

    // --- GESTIÓN DE ETIQUETAS ---
    const handleAssignTag = async (tagId) => {
        if (!tagId) return;
        try {
            await api.post(`/opportunities/${opportunity.id}/tags`, { tag_id: tagId });
            onUpdate(); // Use the onUpdate prop passed from the workspace
        } catch (err) {
            setError('Error al asignar etiqueta.');
            console.error('Error al asignar etiqueta.', err);
        }
    };

    const handleUnassignTag = async (tagId) => {
        try {
            await api.delete(`/opportunities/${opportunity.id}/tags/${tagId}`);
            onUpdate();
        } catch (err) {
            setError('Error al quitar etiqueta.');
            console.error('Error al quitar etiqueta.', err);
        }
    };

    const unassignedUsers = allUsers.filter(user => 
        !opportunity.members.some(member => member.id === user.id)
    );

    const availableTags = allTags.filter(tag => 
        !opportunity.tags.some(assignedTag => assignedTag.id === tag.id)
    );

    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Columna Principal de Formulario */}
            <div className="md:col-span-2">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* ... campos del formulario ... */}
                    <div>
                        <label htmlFor="name" className={labelClass}>Nombre de la Oportunidad</label>
                        <input type="text" name="name" value={formData.name} onChange={handleFormChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="description" className={labelClass}>Descripción</label>
                        <RichTextEditor 
                            content={formData.description || ''} 
                            onUpdate={handleDescriptionChange} 
                        />
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
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">Guardar y Cerrar</button>
                    </div>
                </form>
            </div>

            {/* Columna Lateral para Miembros y Etiquetas */}
            <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Miembros Asignados</h4>
                    <ul className="space-y-2 mb-3">
                        {opportunity.members.map(member => (
                            <li key={member.id} className="flex justify-between items-center text-sm bg-gray-100 px-2 py-1 rounded">
                                <span>{member.nombre_completo}</span>
                                <button onClick={() => handleUnassignMember(member.id)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                            </li>
                        ))}
                    </ul>
                    <select onChange={(e) => handleAssignMember(e.target.value)} value="" className={inputClass}>
                        <option value="" disabled>Asignar miembro...</option>
                        {unassignedUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.nombre_completo}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Etiquetas</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {opportunity.tags.map(tag => (
                            <span key={tag.id} className="flex items-center text-xs font-semibold text-white px-2 py-1 rounded-full" style={{ backgroundColor: tag.color }}>
                                {tag.name}
                                <button onClick={() => handleUnassignTag(tag.id)} className="ml-2 text-white hover:text-gray-200 font-bold">×</button>
                            </span>
                        ))}
                    </div>
                    <select onChange={(e) => handleAssignTag(e.target.value)} value="" className={inputClass}>
                        <option value="" disabled>Asignar etiqueta...</option>
                        {availableTags.map(tag => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default OpportunityDetails;
