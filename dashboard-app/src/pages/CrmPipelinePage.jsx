// dashboard-app/src/pages/CrmPipelinePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Modal from '../components/Modal';
import AddOpportunityForm from '../components/crm/AddOpportunityForm';
import OpportunityWorkspace from '../components/crm/OpportunityWorkspace'; // 1. IMPORTAR

// --- Tarjeta de Oportunidad (ACTUALIZADA) ---
const OpportunityCard = ({ opportunity, onViewDetails, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { checklist_progress, member_count, tags } = opportunity;

    return (
        <div onClick={() => onViewDetails(opportunity.id)} className="bg-white p-4 mb-3 rounded-md shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
            <div className="absolute top-2 right-2">
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="text-gray-400 hover:text-gray-600 z-10">...</button>
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20">
                        <ul className="py-1">
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onViewDetails(opportunity.id); setMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ver/Editar</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(opportunity.id); setMenuOpen(false); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Eliminar</a></li>
                        </ul>
                    </div>
                )}
            </div>
            
            <p className="font-semibold pr-5">{opportunity.name}</p>
            <p className="text-sm text-gray-600">{opportunity.client_name}</p>
            <p className="text-sm text-gray-800 font-bold mt-2">${parseFloat(opportunity.potential_amount || 0).toLocaleString()}</p>
            
            {/* NUEVA SECCIÓN DE INFO RÁPIDA */}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                <div className="flex items-center">
                    {/* Checklist Icon */}
                    {checklist_progress && checklist_progress.total > 0 && (
                        <span className="flex items-center mr-3">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                            {checklist_progress.completed}/{checklist_progress.total}
                        </span>
                    )}
                    {/* Members Icon */}
                    {member_count > 0 && (
                         <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 01-3 5.197z"></path></svg>
                            {member_count}
                        </span>
                    )}
                </div>
                 {opportunity.close_date && (
                    <p>{new Date(opportunity.close_date).toLocaleDateString()}</p>
                )}
            </div>
             {/* Tags */}
            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map(tag => <span key={tag.id} className="text-xs font-semibold px-2 py-1 rounded-full" style={{backgroundColor: tag.color, color: '#fff'}}>{tag.name}</span>)}
                </div>
            )}
        </div>
    );
};


// --- Columna del Pipeline (ACTUALIZADA) ---
const PipelineColumn = ({ stage, opportunities, onAddClick, onViewDetails, onDelete }) => {
    return (
        <div className="bg-gray-100 rounded-lg w-72 p-3 flex-shrink-0 flex flex-col shadow-md">
            <div className="flex justify-between items-center mb-3 px-1">
                 <h2 className="font-bold text-gray-700">{stage.name}</h2>
                 <button onClick={() => onAddClick(stage.id)} className="text-gray-500 hover:text-blue-600 font-bold">+</button>
            </div>
            <div className="flex-grow min-h-[100px]">
                {opportunities.map(opp => <OpportunityCard key={opp.id} opportunity={opp} onViewDetails={onViewDetails} onDelete={onDelete} />)}
            </div>
        </div>
    );
};

// --- Página Principal del CRM (ACTUALIZADA) ---
const CrmPipelinePage = () => {
    const [stages, setStages] = useState([]);
    const [opportunities, setOpportunities] = useState([]);
    const [addingToStage, setAddingToStage] = useState(null);
    const [viewingOpportunity, setViewingOpportunity] = useState(null); // 2. ESTADO RENOMBRADO
    const [loadingError, setLoadingError] = useState('');

    const fetchData = async () => {
        setLoadingError('');
        try {
            const [stagesRes, opportunitiesRes] = await Promise.all([api.get('/stages'), api.get('/opportunities')]);
            setStages(stagesRes.data.filter(s => !s.is_archived));
            setOpportunities(opportunitiesRes.data);
        } catch(err) {
            console.error("Error fetching pipeline data:", err);
            setLoadingError("No se pudieron cargar los datos del pipeline. ¿El servidor está funcionando?");
        }
    };

    useEffect(() => { fetchData(); }, []);
    
    const getOpportunitiesByStage = (stageId) => opportunities.filter(opp => opp.stage_id === stageId);
    
    const handleAddSuccess = () => { setAddingToStage(null); fetchData(); };
    
    // 3. NUEVO HANDLER PARA VER DETALLES
    const handleViewDetails = async (opportunityId) => {
        try {
            const res = await api.get(`/opportunities/${opportunityId}`);
            setViewingOpportunity(res.data);
        } catch (err) {
            console.error("Error fetching opportunity details:", err);
            setLoadingError("No se pudieron cargar los detalles de la oportunidad.");
        }
    };
    
    const handleUpdateAndClose = () => {
        setViewingOpportunity(null);
        fetchData();
    }

    const handleDelete = async (opportunityId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta oportunidad?')) {
            try {
                await api.delete(`/opportunities/${opportunityId}`);
                setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
            } catch (error) {
                console.error("Failed to delete opportunity", error);
                alert('No se pudo eliminar la oportunidad.');
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 mb-6">
                <h1 className="text-3xl font-light text-gray-800">Pipeline de Ventas</h1>
                 {loadingError && <p className="text-red-500 mt-2">{loadingError}</p>}
            </div>

            {/* Modal para Añadir */}
            <Modal isOpen={!!addingToStage} onClose={() => setAddingToStage(null)} title="Crear Nueva Oportunidad">
                <AddOpportunityForm stageId={addingToStage} onSuccess={handleAddSuccess} onClose={() => setAddingToStage(null)} />
            </Modal>

            {/* 4. RENDERIZAR EL NUEVO WORKSPACE */}
            {viewingOpportunity && (
                <OpportunityWorkspace 
                    isOpen={!!viewingOpportunity} 
                    opportunity={viewingOpportunity} 
                    onClose={() => setViewingOpportunity(null)} 
                    onUpdate={handleUpdateAndClose}
                />
            )}
            
            <div className="flex-grow overflow-x-auto">
                <div className="flex space-x-4 p-2 h-full">
                    {stages.map(stage => (
                        <PipelineColumn 
                            key={stage.id} 
                            stage={stage} 
                            opportunities={getOpportunitiesByStage(stage.id)}
                            onAddClick={setAddingToStage}
                            onViewDetails={handleViewDetails} // 5. PASAR EL NUEVO HANDLER
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CrmPipelinePage;