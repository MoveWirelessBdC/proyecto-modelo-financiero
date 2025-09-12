import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchProjects();
        fetchClients();
    }, []);

    const fetchProjects = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_URL}/projects`);
            setProjects(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching projects');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await axios.get(`${API_URL}/clients`);
            setClients(response.data);
        } catch (err) {
            console.error('Could not fetch clients for the form');
        }
    };

    const handleCreate = async (projectData) => {
        try {
            await axios.post(`${API_URL}/projects`, projectData);
            setIsCreating(false);
            fetchProjects();
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating project');
        }
    };

    const handleSelectProject = async (projectId) => {
        try {
            const response = await axios.get(`${API_URL}/projects/${projectId}`);
            setSelectedProject(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching project details');
        }
    };

    if (isLoading) return <p>Loading projects...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    if (selectedProject) {
        return <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />;
    }

    if (isCreating) {
        return <ProjectForm clients={clients} onSave={handleCreate} onCancel={() => setIsCreating(false)} />;
    }

    return (
        <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold gradient-text">Project Management</h2>
                <button onClick={() => setIsCreating(true)} className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                    Create New Project
                </button>
            </div>
            <ProjectTable projects={projects} onSelectProject={handleSelectProject} />
        </div>
    );
};

const ProjectTable = ({ projects, onSelectProject }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-transparent rounded-lg">
            <thead>
                <tr className="bg-gray-700/50">
                    <th className="py-3 px-4 text-left text-white">Description</th>
                    <th className="py-3 px-4 text-left text-white">Client</th>
                    <th className="py-3 px-4 text-left text-white">Amount</th>
                    <th className="py-3 px-4 text-left text-white">Start Date</th>
                    <th className="py-3 px-4 text-left text-white">Actions</th>
                </tr>
            </thead>
            <tbody>
                {projects.map(p => (
                    <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                        <td className="py-3 px-4 text-gray-300">{p.description}</td>
                        <td className="py-3 px-4 text-gray-300">{p.client_name}</td>
                        <td className="py-3 px-4 text-gray-300">${parseFloat(p.amount).toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-300">{new Date(p.start_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                            <button onClick={() => onSelectProject(p.id)} className="text-indigo-400 hover:text-indigo-300">View Details</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ProjectDetail = ({ project, onBack }) => (
    <div className="glass-card p-6 rounded-2xl">
        <button onClick={onBack} className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-500 mb-6">Back to List</button>
        <h2 className="text-2xl font-bold gradient-text mb-4">{project.description}</h2>
        {/* ... display more project details here ... */}
        <h3 className="text-xl font-bold text-white mt-6 mb-4">Amortization Schedule</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-transparent rounded-lg">
                <thead>
                    <tr className="bg-gray-700/50">
                        <th className="py-3 px-4 text-left text-white">Month</th>
                        <th className="py-3 px-4 text-left text-white">Payment</th>
                        <th className="py-3 px-4 text-left text-white">Principal</th>
                        <th className="py-3 px-4 text-left text-white">Interest</th>
                        <th className="py-3 px-4 text-left text-white">Balance</th>
                        <th className="py-3 px-4 text-left text-white">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {project.schedule.map(row => (
                        <tr key={row.id} className="border-b border-gray-700">
                            <td className="py-3 px-4 text-gray-300">{row.month}</td>
                            <td className="py-3 px-4 text-gray-300">${parseFloat(row.monthly_payment).toLocaleString()}</td>
                            <td className="py-3 px-4 text-gray-300">${parseFloat(row.principal).toLocaleString()}</td>
                            <td className="py-3 px-4 text-gray-300">${parseFloat(row.interest).toLocaleString()}</td>
                            <td className="py-3 px-4 text-gray-300">${parseFloat(row.remaining_balance).toLocaleString()}</td>
                            <td className="py-3 px-4 text-gray-300">{row.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const ProjectForm = ({ clients, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ client_id: '', description: '', amount: '', start_date: '', interest_rate: '', insurance_cost: '', term_months: '', sales_commission: '' });

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 glass-card p-6 rounded-2xl">
            <h2 className="text-2xl font-bold gradient-text mb-6">Create New Project</h2>
            {/* Form fields for project details */}
            <select name="client_id" value={formData.client_id} onChange={handleChange} required className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                <option value="">Select a Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Description" required className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="Amount" required className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            <input type="number" name="interest_rate" value={formData.interest_rate} onChange={handleChange} placeholder="Interest Rate (%)" required className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            <input type="number" name="insurance_cost" value={formData.insurance_cost} onChange={handleChange} placeholder="Insurance Cost (%)" required className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            <input type="number" name="term_months" value={formData.term_months} onChange={handleChange} placeholder="Term (Months)" required className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            <input type="number" name="sales_commission" value={formData.sales_commission} onChange={handleChange} placeholder="Sales Commission (%)" required className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            
            <div className="flex justify-end space-x-4">
                <button type="button" onClick={onCancel} className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">Save Project</button>
            </div>
        </form>
    );
};

export default Projects;
