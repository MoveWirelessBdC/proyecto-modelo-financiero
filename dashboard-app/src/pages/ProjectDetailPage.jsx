// dashboard-app/src/pages/ProjectDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';

const ProjectDetailPage = () => {
    const { id } = useParams(); // Obtiene el ID del proyecto desde la URL
    const [project, setProject] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/projects/${id}`);
            setProject(response.data.project);
            setSchedule(response.data.schedule);
        } catch (err) {
            setError('No se pudieron cargar los detalles del proyecto.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const handlePaymentStatus = async (paymentId, newStatus) => {
        try {
            await api.put(`/projects/${id}/payments/${paymentId}`, { status: newStatus });
            // Recargamos los datos para ver el cambio de estado
            fetchProjectDetails();
        } catch (err) {
            alert('Error al actualizar el estado del pago.');
        }
    };

    if (loading) return <h1>Cargando detalles...</h1>;
    if (error) return <h1 style={{ color: 'red' }}>{error}</h1>;
    if (!project) return <h1>Proyecto no encontrado.</h1>;

    return (
        <div>
            <h1>Detalle del Proyecto: {project.description}</h1>
            <h3>Cliente: {project.client_name}</h3>
            <hr />
            <h2>Tabla de Amortización</h2>
            <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Mes</th>
                        <th>Fecha de Pago</th>
                        <th style={{ textAlign: 'right' }}>Cuota Mensual</th>
                        <th style={{ textAlign: 'right' }}>Principal</th>
                        <th style={{ textAlign: 'right' }}>Interés</th>
                        <th style={{ textAlign: 'right' }}>Balance Restante</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {schedule.map(row => (
                        <tr key={row.id}>
                            <td>{row.month_number}</td>
                            <td>{new Date(row.payment_date).toLocaleDateString()}</td>
                            <td style={{ textAlign: 'right' }}>${parseFloat(row.monthly_payment).toLocaleString()}</td>
                            <td style={{ textAlign: 'right' }}>${parseFloat(row.principal).toLocaleString()}</td>
                            <td style={{ textAlign: 'right' }}>${parseFloat(row.interest).toLocaleString()}</td>
                            <td style={{ textAlign: 'right' }}>${parseFloat(row.remaining_balance).toLocaleString()}</td>
                            <td>{row.status}</td>
                            <td>
                                {row.status === 'Pending' && (
                                    <button onClick={() => handlePaymentStatus(row.id, 'Paid')}>
                                        Marcar como Pagado
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProjectDetailPage;