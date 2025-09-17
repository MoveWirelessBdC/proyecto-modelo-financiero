// dashboard-app/src/components/crm/OpportunityWorkspace.jsx
import React, { useState } from 'react';
import OpportunityDetails from './OpportunityDetails'; // Asumimos que este es el componente principal de detalles
import Checklist from './Checklist';
import ActivityFeed from './ActivityFeed';
import api from '../../api/api';

const OpportunityWorkspace = ({ isOpen, onClose, opportunity, onUpdate, onSaveAndClose }) => {
    const [activeTab, setActiveTab] = useState('details');

    if (!isOpen) return null;

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta oportunidad? Esta acción no se puede deshacer.')) {
            try {
                await api.delete(`/opportunities/${opportunity.id}`);
                onSaveAndClose(); // Usar la función que cierra y refresca la lista principal
            } catch (err) {
                console.error('Failed to delete opportunity', err);
            }
        }
    };

    const tabStyle = "px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none";
    const activeTabStyle = "border-b-2 border-blue-500 text-blue-600";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* CABECERA */}
                <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800">{opportunity.name}</h2>
                        <div className="flex items-center space-x-2">
                            {opportunity.tags?.map(tag => (
                                <span key={tag.id} className="px-2.5 py-0.5 text-xs font-semibold text-white rounded-full" style={{ backgroundColor: tag.color || '#6B7280' }}>
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                {/* PESTAÑAS */}
                <div className="border-b border-gray-200 flex-shrink-0">
                    <nav className="-mb-px flex space-x-6 px-4">
                        <button className={`${tabStyle} ${activeTab === 'details' ? activeTabStyle : ''}`} onClick={() => setActiveTab('details')}>Detalles</button>
                        <button className={`${tabStyle} ${activeTab === 'checklist' ? activeTabStyle : ''}`} onClick={() => setActiveTab('checklist')}>Checklist</button>
                        <button className={`${tabStyle} ${activeTab === 'activity' ? activeTabStyle : ''}`} onClick={() => setActiveTab('activity')}>Actividad</button>
                    </nav>
                </div>

                {/* CONTENIDO DE PESTAÑAS (CON SCROLL) */}
                <div className="p-6 overflow-y-auto h-[60vh]">
                    {activeTab === 'details' &&
                        <OpportunityDetails
                            opportunity={opportunity}
                            onUpdate={onUpdate}
                            onSaveAndClose={onSaveAndClose}
                        />
                    }
                    {activeTab === 'checklist' && (
                        <Checklist opportunity={opportunity} onUpdate={onUpdate} />
                    )}
                    {activeTab === 'activity' && (
                        <ActivityFeed opportunity={opportunity} onUpdate={onUpdate} />
                    )}
                </div>

                {/* PIE DE PÁGINA */}
                <div className="flex justify-between items-center p-4 border-t flex-shrink-0">
                    <button onClick={handleDelete} className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md">
                        Eliminar Oportunidad
                    </button>
                    <div></div>
                </div>
            </div>
        </div>
    );
};

export default OpportunityWorkspace;