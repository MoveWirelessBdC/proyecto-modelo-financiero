// dashboard-app/src/components/crm/OpportunityWorkspace.jsx
import React, { useState } from 'react';
import OpportunityDetails from './OpportunityDetails';
import Checklist from './Checklist';
import ActivityFeed from './ActivityFeed'; // Import the new component

const OpportunityWorkspace = ({ opportunity, isOpen, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('details');

    if (!isOpen) return null;

    // Estilos de Tailwind para las pestañas
    const tabStyle = "px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none";
    const activeTabStyle = "border-b-2 border-blue-500 text-blue-600";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{opportunity.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6 px-4">
                        <button 
                            className={`${tabStyle} ${activeTab === 'details' ? activeTabStyle : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            Detalles
                        </button>
                        <button 
                            className={`${tabStyle} ${activeTab === 'checklist' ? activeTabStyle : ''}`}
                            onClick={() => setActiveTab('checklist')}
                        >
                            Checklist
                        </button>
                        <button 
                            className={`${tabStyle} ${activeTab === 'activity' ? activeTabStyle : ''}`}
                            onClick={() => setActiveTab('activity')}
                        >
                            Actividad y Comentarios
                        </button>
                    </nav>
                </div>

                <div className="p-6 overflow-y-auto">
                    {activeTab === 'details' && (
                        <OpportunityDetails opportunity={opportunity} onUpdate={onUpdate} />
                    )}
                    {activeTab === 'checklist' && (
                        <Checklist opportunity={opportunity} onUpdate={onUpdate} />
                    )}
                    {activeTab === 'activity' && (
                        <ActivityFeed opportunity={opportunity} onUpdate={onUpdate} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpportunityWorkspace;