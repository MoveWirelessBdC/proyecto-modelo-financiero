// dashboard-app/src/pages/ProjectsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');

    const [newProject, setNewProject] = useState({
        client_id: '',
        description: 'Financiamiento de Equipo Tecnológico',
        amount: '',
        start_date: new Date().toISOString().split('T')[0],
        interest_rate: '25',
        insurance_cost: '0',
        term_months: '12',
        sales_commission: '0'
    });

    const fetchData = async () => {
        try {
            setError('');
            const projectsResponse = await api.get('/projects');
            const clientsResponse = await api.get('/clients');
            setProjects(projectsResponse.data);
            setClients(clientsResponse.data);
            if (clientsResponse.data.length > 0 && !newProject.client_id) {
                setNewProject(prev => ({ ...prev, client_id: clientsResponse.data[0].id }));
            }
        } catch (err) {
            setError('No se pudo cargar la información de la página.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProject(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!newProject.client_id || !newProject.amount) {
            setFormError('Cliente y Monto son obligatorios.');
            return;
        }
        try {
            await api.post('/projects', newProject);
            // Después de crear, volvemos a buscar los datos para actualizar la lista
            fetchData();
        } catch (err) {
            setFormError('Error al crear el proyecto.');
            console.error(err);
        }
    };

    if (loading) {
        return <h1>Cargando...</h1>;
    }

    if (error) {
        return <h1 style={{ color: 'red' }}>{error}</h1>;
    }

    return (
        <div>
            <h1>Gestión de Proyectos</h1>
            <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>Añadir Nuevo Proyecto</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label>Cliente</label>
                        <select name="client_id" value={newProject.client_id} onChange={handleInputChange} style={inputStyle}>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Monto a Financiar ($)</label>
                        <input type="number" name="amount" value={newProject.amount} onChange={handleInputChange} style={inputStyle} placeholder="Ej: 5000" />
                    </div>
                    <div>
                        <label>Tasa de Interés Anual (%)</label>
                        <input type="number" name="interest_rate" value={newProject.interest_rate} onChange={handleInputChange} style={inputStyle} />
                    </div>
                    <div>
                        <label>Plazo (Meses)</label>
                        <input type="number" name="term_months" value={newProject.term_months} onChange={handleInputChange} style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label>Descripción</label>
                        <input type="text" name="description" value={newProject.description} onChange={handleInputChange} style={inputStyle} />
                    </div>
                    {formError && <p style={{ color: 'red', gridColumn: '1 / -1' }}>{formError}</p>}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <button type="submit" style={{ padding: '10px 15px' }}>Crear Proyecto</button>
                    </div>
                </form>
            </div>

            <h3>Lista de Proyectos</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #333' }}>
                        <th style={tableCellStyle}>Cliente</th>
                        <th style={tableCellStyle}>Monto</th>
                        <th style={tableCellStyle}>Tasa</th>
                        <th style={tableCellStyle}>Plazo</th>
                        <th style={tableCellStyle}>Fecha de Inicio</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map(project => (
                        <tr key={project.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={tableCellStyle}>
                                <Link to={`/projects/${project.id}`} style={{ textDecoration: 'underline', color: 'blue' }}>
                                    {project.client_name}
                                </Link>
                            </td>
                            <td style={tableCellStyle}>${parseFloat(project.amount).toLocaleString('en-US')}</td>
                            <td style={tableCellStyle}>{parseFloat(project.interest_rate).toFixed(2)}%</td>
                            <td style={tableCellStyle}>{project.term_months} meses</td>
                            <td style={tableCellStyle}>{new Date(project.start_date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const inputStyle = {
    width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
};

const tableCellStyle = {
    padding: '10px', textAlign: 'left'
};

export default ProjectsPage;