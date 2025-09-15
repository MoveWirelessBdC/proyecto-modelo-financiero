// dashboard-app/src/pages/CrmPipelinePage.jsx
import React, { useState, useEffect } from 'react';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../api/api';
import Modal from '../components/Modal';
import AddOpportunityForm from '../components/crm/AddOpportunityForm';

const OpportunityCard = ({ opportunity }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: opportunity.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white p-4 mb-3 rounded-md shadow-sm border">
            {/* --- NUEVO: Contenedor para las etiquetas --- */}
            <div className="flex flex-wrap gap-1 mb-2">
                {opportunity.tags && opportunity.tags.map(tag => (
                    <span key={tag.id} className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: tag.color, color: 'white' }}>
                        {tag.name}
                    </span>
                ))}
            </div>
            <p className="font-semibold">{opportunity.name}</p>
            <p className="text-sm text-gray-600">{opportunity.client_name}</p>
            <p className="text-sm text-gray-800 font-bold mt-2">${parseFloat(opportunity.potential_amount || 0).toLocaleString()}</p>
        </div>
    );
};

// --- COLUMNA DEL PIPELINE CON MENÚ DE ACCIONES ---
const PipelineColumn = ({ stage, opportunities, onAddClick, onStageUpdate, onStageArchive }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [stageName, setStageName] = useState(stage.name);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleNameUpdate = () => {
        setIsEditing(false);
        if (stageName.trim() && stageName !== stage.name) {
            onStageUpdate(stage.id, { ...stage, name: stageName });
        } else {
            setStageName(stage.name);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleNameUpdate();
        if (e.key === 'Escape') {
            setStageName(stage.name);
            setIsEditing(false);
        }
    };

    return (
        <div className="bg-gray-100 rounded-lg w-72 p-3 flex-shrink-0 flex flex-col shadow-md">
            <div className="flex justify-between items-center mb-3 px-1">
                {isEditing ? (
                    <input
                        type="text"
                        value={stageName}
                        onChange={(e) => setStageName(e.target.value)}
                        onBlur={handleNameUpdate}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="font-bold text-gray-700 w-full border border-blue-500 rounded"
                    />
                ) : (
                    <h2 onClick={() => setIsEditing(true)} className="font-bold text-gray-700 cursor-pointer">{stage.name}</h2>
                )}
                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-500 hover:text-gray-800">...</button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <ul className="py-1">
                                <li>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onStageArchive(stage); setMenuOpen(false); }}
                                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Archivar esta lista
                                    </a>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-grow min-h-[100px]">
                <SortableContext items={opportunities.map(o => o.id)}>
                    {opportunities.map(opp => <OpportunityCard key={opp.id} opportunity={opp} />)}
                </SortableContext>
            </div>
            <button onClick={() => onAddClick(stage.id)} className="text-left p-2 text-gray-500 hover:bg-gray-200 rounded-md mt-2">
                + Añadir una tarjeta
            </button>
        </div>
    );
};

// --- COMPONENTE PARA AÑADIR UNA NUEVA COLUMNA ---
const AddStageColumn = ({ onStageCreate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [stageName, setStageName] = useState('');

    const handleSave = () => {
        if (stageName.trim()) {
            onStageCreate(stageName);
            setStageName('');
            setIsAdding(false);
        }
    };

    if (!isAdding) {
        return (
            <button onClick={() => setIsAdding(true)} className="bg-gray-200 hover:bg-gray-300 rounded-lg w-72 p-3 flex-shrink-0 text-gray-600">
                + Añadir otra lista
            </button>
        );
    }

    return (
        <div className="bg-gray-200 rounded-lg w-72 p-3 flex-shrink-0">
            <input
                type="text"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="Introduzca un título para la lista..."
                autoFocus
                className="w-full p-2 rounded-md border"
            />
            <div className="mt-2">
                <button onClick={handleSave} className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700">Guardar</button>
                <button onClick={() => setIsAdding(false)} className="ml-2 text-gray-600">✕</button>
            </div>
        </div>
    );
};


const CrmPipelinePage = () => {
    const [stages, setStages] = useState([]);
    const [opportunities, setOpportunities] = useState([]);
    const [addingToStage, setAddingToStage] = useState(null);

    const fetchData = async () => {
        const stagesRes = await api.get('/stages');
        const opportunitiesRes = await api.get('/opportunities');
        setStages(stagesRes.data);
        setOpportunities(opportunitiesRes.data);
    };

    useEffect(() => { fetchData(); }, []);
    
    const getOpportunitiesByStage = (stageId) => opportunities.filter(opp => opp.stage_id === stageId);
    
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        
        const activeOpp = opportunities.find(o => o.id === active.id);
        const newStageId = Number(over.id.replace('stage-', ''));

        if (activeOpp.stage_id === newStageId) return;

        setOpportunities(prev => prev.map(opp => 
            opp.id === active.id ? { ...opp, stage_id: newStageId } : opp
        ));

        try {
            await api.put(`/opportunities/${active.id}`, { stage_id: newStageId });
        } catch (error) {
            console.error("Failed to update opportunity", error);
            setOpportunities(prev => prev.map(opp =>
                opp.id === active.id ? activeOpp : opp
            ));
        }
    };

    const handleAddSuccess = () => { setAddingToStage(null); fetchData(); };

    const handleStageUpdate = async (stageId, updatedStageData) => {
        try {
            await api.put(`/stages/${stageId}`, updatedStageData);
            setStages(prevStages => prevStages.map(s => s.id === stageId ? updatedStageData : s));
        } catch (error) {
            console.error("Failed to update stage", error);
            alert("No se pudo actualizar la etapa.");
        }
    };

    const handleStageCreate = async (name) => {
        try {
            const maxOrder = stages.reduce((max, s) => Math.max(max, s.stage_order), 0);
            await api.post('/stages', { name, stage_order: maxOrder + 1 });
            fetchData();
        } catch (error) {
            alert('No se pudo crear la nueva etapa.');
        }
    };
    
    const handleStageArchive = async (stageToArchive) => {
        try {
            await api.put(`/stages/${stageToArchive.id}`, { ...stageToArchive, is_archived: true });
            setStages(prevStages => prevStages.filter(s => s.id !== stageToArchive.id));
        } catch (error) {
            alert('No se pudo archivar la etapa.');
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 mb-6">
                <h1 className="text-3xl font-light text-gray-800">Pipeline de Ventas</h1>
            </div>

            <Modal isOpen={!!addingToStage} onClose={() => setAddingToStage(null)} title="Crear Nueva Oportunidad">
                <AddOpportunityForm stageId={addingToStage} onSuccess={handleAddSuccess} onClose={() => setAddingToStage(null)} />
            </Modal>
            
            <div className="flex-grow overflow-x-auto">
                <DndContext onDragEnd={handleDragEnd}>
                    <div className="flex space-x-4 p-2 h-full">
                        {stages.map(stage => (
                            <PipelineColumn 
                                key={stage.id} 
                                stage={stage} 
                                opportunities={getOpportunitiesByStage(stage.id)}
                                onAddClick={setAddingToStage}
                                onStageUpdate={handleStageUpdate}
                                onStageArchive={handleStageArchive}
                            />
                        ))}
                        <AddStageColumn onStageCreate={handleStageCreate} />
                    </div>
                </DndContext>
            </div>
        </div>
    );
};

export default CrmPipelinePage;