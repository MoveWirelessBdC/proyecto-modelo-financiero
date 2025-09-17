
// dashboard-app/src/components/crm/Checklist.jsx
import React, { useState } from 'react';
import api from '../../api/api';

const Checklist = ({ opportunity, onUpdate }) => {
    const [newItemText, setNewItemText] = useState('');

    const handleToggle = async (item) => {
        try {
            await api.put(`/checklist/${item.id}`, { is_completed: !item.is_completed });
            onUpdate();
        } catch (err) {
            console.error("Failed to toggle checklist item", err);
        }
    };

    const handleDelete = async (itemId) => {
        try {
            await api.delete(`/checklist/${itemId}`);
            onUpdate();
        } catch (err) {
            console.error("Failed to delete checklist item", err);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemText.trim()) return;
        try {
            await api.post(`/opportunities/${opportunity.id}/checklist`, { text: newItemText });
            setNewItemText('');
            onUpdate();
        } catch (err) {
            console.error("Failed to add checklist item", err);
        }
    };

    return (
        <div>
            <ul className="space-y-3">
                {opportunity.checklist.map(item => (
                    <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                        <div className="flex items-center">
                            <input 
                                type="checkbox"
                                checked={item.is_completed}
                                onChange={() => handleToggle(item)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={`ml-3 text-sm ${item.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                {item.text}
                            </span>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600 text-lg">×</button>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleAddItem} className="mt-6 flex items-center">
                <input 
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Añadir nueva tarea..."
                    className="flex-grow mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button type="submit" className="ml-3 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">Añadir</button>
            </form>
        </div>
    );
};

export default Checklist;
