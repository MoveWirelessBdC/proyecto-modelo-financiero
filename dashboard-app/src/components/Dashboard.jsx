import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import MetricCard from './MetricCard';
import RiskGauge from './RiskGauge';

const API_URL = 'http://localhost:3001/api';

const Dashboard = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const response = await axios.get(`${API_URL}/portfolio/overview`);
                setOverview(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching dashboard data');
            }
            setLoading(false);
        };

        fetchOverview();
    }, []);

    const formatCurrency = (val) => `${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (loading) {
        return <div className="text-center text-white">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="glass-card p-8 rounded-3xl shadow-2xl mb-8 text-center">
                <h1 className="text-4xl font-bold text-white mb-2">🚀 Portfolio Control Center</h1>
                <h2 className="text-xl text-white opacity-90">Live Financial Dashboard</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <RiskGauge
                    value={overview?.ltv || 0}
                    low={60} // These should come from config later
                    high={80} // These should come from config later
                    title="LTV Actual"
                />
                <MetricCard
                    title="Valor del Portafolio"
                    value={formatCurrency(overview?.totalMarketValue || 0)}
                    subtitle="Valor de Mercado Actual"
                    icon="💹"
                    color="green"
                />
                <MetricCard
                    title="Deuda Total con Broker"
                    value={formatCurrency(overview?.totalDebt || 0)}
                    subtitle="Suma de saldos pendientes"
                    icon="🔥"
                    color="red"
                />
                <MetricCard
                    title="Ingresos por Intereses"
                    value={formatCurrency(overview?.interestIncomeThisMonth || 0)}
                    subtitle="Este Mes"
                    icon="💰"
                    color="blue"
                />
            </div>

            {/* Placeholder for future charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">LTV Histórico (Próximamente)</h3>
                    <div style={{ width: '100%', height: '300px' }} className="flex items-center justify-center">
                        <p className="text-gray-500">Chart will be implemented here.</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Cartera vs Deuda (Próximamente)</h3>
                    <div style={{ width: '100%', height: '300px' }} className="flex items-center justify-center">
                        <p className="text-gray-500">Chart will be implemented here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
