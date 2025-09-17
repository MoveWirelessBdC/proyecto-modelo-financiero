import React, { useState } from 'react';
import api from '../../api/api';
import RichTextEditor from '../common/RichTextEditor'; // Importar el componente reutilizable

const ActivityFeed = ({ opportunity, onUpdate }) => {
    const [newComment, setNewComment] = useState('');

    const handleAddComment = async () => {
        // No enviar si el contenido está vacío (Tiptap genera <p></p> por defecto)
        if (newComment.trim() === '' || newComment === '<p></p>') return;

        try {
            await api.post(`/opportunities/${opportunity.id}/activities`, {
                type: 'comment',
                description: newComment, // CORREGIDO: de 'content' a 'description'
            });
            setNewComment(''); // Limpiar el editor
            onUpdate(); // Refrescar datos para mostrar el nuevo comentario
        } catch (err) {
            console.error("Failed to add comment", err);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad y Comentarios</h3>
            
            <div className="mb-6">
                <RichTextEditor 
                    content={newComment} 
                    onUpdate={setNewComment} 
                />
            </div>
            
            <div className="flex justify-end mt-2">
                <button onClick={handleAddComment} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                    Agregar Comentario
                </button>
            </div>

            {/* Lista de actividades */}
            <div className="space-y-6 mt-8">
                {opportunity.activities?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(activity => (
                    <div key={activity.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                            <span className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 text-xl">
                                {activity.type === 'comment' ? '💬' : '📝'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                <span className="font-bold text-gray-700">{activity.user_name}</span>
                                {' comentó a las '}
                                {new Date(activity.created_at).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div 
                                className="mt-2 text-gray-800 bg-gray-50 p-3 rounded-md prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: activity.description }} 
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityFeed;