import { useState, useEffect } from 'react';
import api from '../api/api';
import MetricCard from '../components/MetricCard';
import RiskGauge from '../components/RiskGauge';

// --- VALORES DE EJEMPLO ---
// Estos valores deberían venir de una configuración de la base de datos en el futuro.
const BROKER_INTEREST_EXPENSE_MONTHLY = 5350.75; // Gasto mensual por intereses del bróker
const OPERATING_EXPENSE_MONTHLY = 12500.00; // Costos operativos fijos mensuales

const FinancialHealth = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Reutilizamos el endpoint existente que ya tiene casi todo lo que necesitamos
                const response = await api.get(`/portfolio/overview`);
                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching financial health data');
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const formatCurrency = (val) => {
        if (typeof val !== 'number' && typeof val !== 'string') {
            val = 0;
        }
        const num = parseFloat(val);
        return `${num.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}`;
    };
    
    // Calculamos el nuevo KPI: Flujo de Caja Operativo
    const calculateOperatingCashFlow = () => {
        if (!data) return 0;
        const interestIncome = parseFloat(data.interestIncomeThisMonth) || 0;
        return interestIncome - BROKER_INTEREST_EXPENSE_MONTHLY - OPERATING_EXPENSE_MONTHLY;
    };

    if (loading) {
        return <div className="text-center text-gray-500">Loading Financial Health...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    const operatingCashFlow = calculateOperatingCashFlow();

    return (
        <div className="bg-gray-900 text-white p-4 md:p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-6">Zona de Salud Financiera</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Medidor de LTV (Existente) */}
                <RiskGauge
                    value={data?.ltv || 0}
                    low={60}
                    high={80}
                    title="LTV Actual"
                />
                {/* 2. KPIs Principales (Existentes) */}
                <MetricCard
                    title="Valor del Portafolio"
                    value={formatCurrency(data?.totalMarketValue)}
                    subtitle="Valor de Mercado Actual"
                    icon="💹"
                />
                <MetricCard
                    title="Deuda Total"
                    value={formatCurrency(data?.totalDebt)}
                    subtitle="Suma de saldos pendientes"
                    icon="🔥"
                />
                {/* 3. NUEVO - Indicador de Flujo de Caja Operativo */}
                <MetricCard
                    title="Flujo de Caja Operativo"
                    value={formatCurrency(operatingCashFlow)}
                    subtitle="Rentabilidad en efectivo (Mes)"
                    icon={operatingCashFlow >= 0 ? '✅' : '⚠️'}
                    color={operatingCashFlow >= 0 ? 'green' : 'yellow'}
                />
            </div>
             <div className="text-xs text-gray-400 mt-4">
                * Flujo de Caja Operativo = (Ingresos por Intereses) - (Gastos Intereses Bróker) - (Costos Operativos).
                Los gastos y costos son valores de ejemplo.
            </div>
        </div>
    );
};

export default FinancialHealth;
