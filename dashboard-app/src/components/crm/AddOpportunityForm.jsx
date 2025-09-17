// dashboard-app/src/components/crm/AddOpportunityForm.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const AddOpportunityForm = ({ onSuccess, onClose, stageId }) => {
    const [clients, setClients] = useState([]);
    const [stages, setStages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [formData, setFormData] = useState({ name: '', client_id: '', stage_id: stageId || '', potential_amount: '', teamMembers: [] });
    const [submitError, setSubmitError] = useState('');
    const [loadingError, setLoadingError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [clientsRes, stagesRes] = await Promise.all([
                    api.get('/clients'),
                    api.get('/stages')
                ]);

                setClients(clientsRes.data);
                setStages(stagesRes.data);

                if (clientsRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, client_id: clientsRes.data[0].id }));
                }
                const firstStage = stagesRes.data.find(s => !s.name.includes('Cerrado'));
                if(firstStage) {
                   setFormData(prev => ({ ...prev, stage_id: stageId || firstStage.id }));
                }
            } catch (err) {
                console.error("Error loading form data:", err);
                setLoadingError("No se pudieron cargar los clientes/etapas. Revisa la consola del backend.");
            }
        };
        loadData();
    }, [stageId]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSuggestedUsers([]);
            return;
        }

        const fetchUsers = async () => {
            try {
                const { data } = await api.get(`/users?search=${searchTerm}`);
                const filteredSuggestions = data.filter(user => !selectedMembers.some(member => member.id === user.id));
                setSuggestedUsers(filteredSuggestions);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const debounceFetch = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounceFetch);
    }, [searchTerm, selectedMembers]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSelectMember = (user) => {
        setSelectedMembers([...selectedMembers, user]);
        setFormData(prev => ({ ...prev, teamMembers: [...prev.teamMembers, user.id] }));
        setSearchTerm('');
        setSuggestedUsers([]);
    };

    const handleRemoveMember = (userId) => {
        setSelectedMembers(selectedMembers.filter(member => member.id !== userId));
        setFormData(prev => ({ ...prev, teamMembers: prev.teamMembers.filter(id => id !== userId) }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitError('');

        if (!formData.name || !formData.client_id || !formData.stage_id) {
            setSubmitError('Por favor, complete todos los campos requeridos.');
            return;
        }

        try {
            await api.post('/opportunities', formData);
            onSuccess(); // Cierra el modal y refresca el pipeline
        } catch (err) {
            console.error("Error creating opportunity:", err);
            setSubmitError(err.response?.data?.message || 'Error al crear la oportunidad.');
        }
    };

    const inputClasses = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {loadingError && <p className="text-red-500 text-sm font-bold">{loadingError}</p>}

            <div>
                <label htmlFor="name" className={labelClasses}>Nombre de la Oportunidad</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="client_id" className={labelClasses}>Cliente</label>
                    <select id="client_id" name="client_id" value={formData.client_id} onChange={handleChange} className={inputClasses} disabled={clients.length === 0}>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="stage_id" className={labelClasses}>Etapa Inicial</label>
                    <select id="stage_id" name="stage_id" value={formData.stage_id} onChange={handleChange} className={inputClasses} disabled={stages.length === 0}>
                        {stages.filter(s => !s.name.includes('Cerrado')).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="potential_amount" className={labelClasses}>Monto Potencial ($)</label>
                <input id="potential_amount" type="number" name="potential_amount" value={formData.potential_amount} onChange={handleChange} className={inputClasses} placeholder="0.00" />
            </div>

            <div>
                <label htmlFor="team_members" className={labelClasses}>Miembros del Equipo</label>
                <div className="relative">
                    <input
                        id="team_members"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={inputClasses}
                        placeholder="Buscar por nombre o email..."
                    />
                    {suggestedUsers.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                            {suggestedUsers.map(user => (
                                <li
                                    key={user.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleSelectMember(user)}
                                >
                                    {user.name} ({user.email})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMembers.map(member => (
                        <div key={member.id} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            {member.name}
                            <button
                                type="button"
                                onClick={() => handleRemoveMember(member.id)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

            <div className="flex justify-end pt-4">
                <button type="button" onClick={onClose} className="mr-3 py-2 px-4 rounded-md text-gray-600 hover:bg-gray-100">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Guardar Oportunidad</button>
            </div>
        </form>
    );
};

export default AddOpportunityForm;