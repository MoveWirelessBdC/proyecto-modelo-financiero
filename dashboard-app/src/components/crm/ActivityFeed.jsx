
// dashboard-app/src/components/crm/ActivityFeed.jsx
import React, { useState } from 'react';
import api from '../../api/api';

const ActivityFeed = ({ opportunity, onUpdate }) => {
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setError('');
        try {
            await api.post(`/opportunities/${opportunity.id}/activities`, { 
                description: newComment,
                type: 'Comment' 
            });
            setNewComment('');
            onUpdate();
        } catch (err) {
            console.error("Failed to add comment", err);
            setError('No se pudo añadir el comentario.');
        }
    };

    const formatTimestamp = (ts) => {
        return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    }

    return (
        <div>
            {/* Formulario para añadir nuevo comentario */}
            <form onSubmit={handleAddComment} className="mb-6">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Añadir un comentario..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    rows="3"
                ></textarea>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                <div className="text-right mt-2">
                    <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">Comentar</button>
                </div>
            </form>

            {/* Lista de actividades */}
            <ul className="space-y-6">
                {opportunity.activities.map(activity => (
                    <li key={activity.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600 text-sm">
                                {activity.user_name ? activity.user_name.charAt(0).toUpperCase() : '?'}
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm">
                                <span className="font-medium text-gray-900">{activity.user_name}</span>
                            </div>
                            <div className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                <p>{activity.description}</p>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                                <time dateTime={activity.created_at}>{formatTimestamp(activity.created_at)}</time>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActivityFeed;
