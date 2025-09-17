// dashboard-app/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import TeamDashboard from '../components/TeamDashboard'; // Importamos el nuevo dashboard

// El dashboard original para roles de gestión y observación
const GeneralDashboard = () => {
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
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    const getLtvColor = (ltv) => {
        if (ltv > 80) return 'text-red-500';
        if (ltv > 65) return 'text-orange-500';
        return 'text-green-600';
    };

    const getLtvLevel = (ltv) => {
        if (ltv > 80) return 'Defensivo';
        if (ltv > 65) return 'Consolidación';
        return 'Óptimo';
    }

    if (loading) return <div className="p-8"><h1>Cargando Dashboard General...</h1></div>;
    if (error) return <div className="p-8"><h1 className="text-red-500">{error}</h1></div>;

    const ltvValue = parseFloat(data.ltv);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-light text-gray-800 mb-12">Dashboard General</h1>
            
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1 flex flex-col justify-center items-center p-6 bg-white rounded-lg border border-gray-200">
                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Loan-to-Value (LTV)</h2>
                    <p className={`text-7xl font-light mt-2 ${getLtvColor(ltvValue)}`}>
                        {ltvValue.toFixed(2)}%
                    </p>
                    <p className={`mt-2 text-lg ${getLtvColor(ltvValue)}`}>
                        Nivel: {getLtvLevel(ltvValue)}
                    </p>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-8">
                    <div className="p-6 bg-white rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Valor del Portafolio</h3>
                        <p className="text-4xl font-medium text-gray-800 mt-2">${parseFloat(data.totalMarketValue).toLocaleString('en-US')}</p>
                    </div>
                     <div className="p-6 bg-white rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Deuda Total</h3>
                        <p className="text-4xl font-medium text-gray-800 mt-2">${parseFloat(data.totalDebt).toLocaleString('en-US')}</p>
                    </div>
                     <div className="p-6 bg-white rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ingresos por Interés (Mes)</h3>
                        <p className="text-4xl font-medium text-gray-800 mt-2">${parseFloat(data.interestIncomeThisMonth).toLocaleString('en-US')}</p>
                    </div>
                     <div className="p-6 bg-white rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pagos Pendientes (Mes)</h3>
                        <p className="text-4xl font-medium text-gray-800 mt-2">{data.pendingPaymentsThisMonth}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente principal que actúa como selector
const DashboardPage = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="p-8"><h1>Cargando...</h1></div>;
    }

    // Lógica de selección de dashboard
    if (user && user.rol === 'Team Member') {
        return <TeamDashboard />;
    }

    // Para todos los demás roles (Owner, Admin, Manager, Observer), muestra el dashboard general
    return <GeneralDashboard />;
};

export default DashboardPage;