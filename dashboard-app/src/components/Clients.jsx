import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingClient, setEditingClient] = useState(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_URL}/clients`);
            setClients(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching clients');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (clientData) => {
        try {
            if (editingClient.id) {
                // Update
                await axios.put(`${API_URL}/clients/${editingClient.id}`, clientData);
            } else {
                // Create
                await axios.post(`${API_URL}/clients`, clientData);
            }
            setEditingClient(null);
            fetchClients(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving client');
        }
    };

    const handleDelete = async (clientId) => {
        if (window.confirm('Are you sure you want to delete this client? This might fail if they have active projects.')) {
            try {
                await axios.delete(`${API_URL}/clients/${clientId}`);
                fetchClients(); // Refresh list
            } catch (err) {
                setError(err.response?.data?.message || 'Error deleting client');
            }
        }
    };

    return (
        <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold gradient-text">Client Management</h2>
                <button onClick={() => setEditingClient({ name: '', contact_info: '' })} className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                    Add New Client
                </button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {isLoading && <p>Loading clients...</p>}

            {!isLoading && !editingClient && (
                <ClientTable clients={clients} onEdit={setEditingClient} onDelete={handleDelete} />
            )}

            {editingClient && (
                <ClientForm 
                    client={editingClient} 
                    onSave={handleSave} 
                    onCancel={() => setEditingClient(null)} 
                />
            )}
        </div>
    );
};

const ClientTable = ({ clients, onEdit, onDelete }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-transparent rounded-lg">
            <thead>
                <tr className="bg-gray-700/50">
                    <th className="py-3 px-4 text-left text-white">Name</th>
                    <th className="py-3 px-4 text-left text-white">Contact Info</th>
                    <th className="py-3 px-4 text-left text-white">Actions</th>
                </tr>
            </thead>
            <tbody>
                {clients.map(client => (
                    <tr key={client.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                        <td className="py-3 px-4 text-gray-300">{client.name}</td>
                        <td className="py-3 px-4 text-gray-300">{client.contact_info}</td>
                        <td className="py-3 px-4">
                            <button onClick={() => onEdit(client)} className="text-indigo-400 hover:text-indigo-300 mr-4">Edit</button>
                            <button onClick={() => onDelete(client.id)} className="text-red-400 hover:text-red-300">Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ClientForm = ({ client, onSave, onCancel }) => {
    const [formData, setFormData] = useState(client);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300">Contact Info</label>
                <textarea 
                    name="contact_info"
                    value={formData.contact_info}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>
            <div className="flex justify-end space-x-4">
                <button type="button" onClick={onCancel} className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">Save Client</button>
            </div>
        </form>
    );
};

export default Clients;
