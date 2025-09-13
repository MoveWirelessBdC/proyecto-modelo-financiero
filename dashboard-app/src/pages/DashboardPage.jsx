// dashboard-app/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api'; // Usamos nuestro nuevo cliente de API

const KPICard = ({ title, value }) => (
    <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3 style={{ margin: 0, color: '#555' }}>{title}</h3>
        <p style={{ fontSize: '2em', margin: '10px 0 0 0', fontWeight: 'bold' }}>
            {typeof value === 'number' ? `$${value.toLocaleString('en-US')}` : value}
        </p>
    </div>
);

const RiskGauge = ({ ltv }) => {
    let color = 'green';
    let level = 'Óptimo';

    if (ltv > 80) {
        color = 'red';
        level = 'Defensivo';
    } else if (ltv > 65) {
        color = 'orange';
        level = 'Consolidación';
    }

    return (
        <div style={{ border: `3px solid ${color}`, padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#555' }}>Loan-to-Value (LTV)</h3>
            <p style={{ fontSize: '3em', margin: '10px 0', fontWeight: 'bold', color }}>{ltv}%</p>
            <p style={{ margin: 0, fontSize: '1.2em', color }}>Nivel: {level}</p>
        </div>
    );
};


const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const response = await api.get('/portfolio/overview');
                setData(response.data);
            } catch (err) {
                setError('No se pudieron cargar los datos del dashboard.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, []); // El array vacío asegura que se ejecute solo una vez, al cargar el componente

    if (loading) {
        return <h1>Cargando KPIs...</h1>;
    }

    if (error) {
        return <h1 style={{ color: 'red' }}>{error}</h1>;
    }

    return (
        <div>
            <h1>Dashboard Principal</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <RiskGauge ltv={parseFloat(data.ltv)} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <KPICard title="Valor del Portafolio" value={parseFloat(data.totalMarketValue)} />
                    <KPICard title="Deuda Total" value={parseFloat(data.totalDebt)} />
                    <KPICard title="Ingresos por Interés (Mes)" value={parseFloat(data.interestIncomeThisMonth)} />
                    <KPICard title="Pagos Pendientes (Mes)" value={parseInt(data.pendingPaymentsThisMonth, 10)} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;