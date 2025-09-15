// dashboard-app/src/components/crm/AddOpportunityForm.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const AddOpportunityForm = ({ onSuccess, onClose, stageId }) => {
    const [clients, setClients] = useState([]);
    const [stages, setStages] = useState([]);
    const [formData, setFormData] = useState({ name: '', client_id: '', stage_id: stageId || '', potential_amount: '' });
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

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => { /* ... (sin cambios) ... */ };

    const inputClasses = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mostramos el error de carga si existe */}
            {loadingError && <p className="text-red-500 text-sm font-bold">{loadingError}</p>}

            <div>
                <label htmlFor="name" className={labelClasses}>Nombre de la Oportunidad</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="client_id" className={labelClasses}>Cliente</label>
                    <select id="client_id" name="client_id" value={formData.client_id} onChange={handleChange} className={inputClasses} disabled={loadingError}>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="stage_id" className={labelClasses}>Etapa Inicial</label>
                    <select id="stage_id" name="stage_id" value={formData.stage_id} onChange={handleChange} className={inputClasses} disabled={loadingError}>
                        {stages.filter(s => !s.name.includes('Cerrado')).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="potential_amount" className={labelClasses}>Monto Potencial ($)</label>
                <input id="potential_amount" type="number" name="potential_amount" value={formData.potential_amount} onChange={handleChange} className={inputClasses} placeholder="0.00" />
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