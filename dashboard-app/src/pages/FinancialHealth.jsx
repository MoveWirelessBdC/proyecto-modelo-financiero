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
        <div className="glass-card p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
            {/* Header con indicador de estado general */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">💼 Salud Financiera</h2>
                    <p className="text-gray-600 text-sm">KPIs vitales del negocio en tiempo real</p>
                </div>
                <div className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm ${
                    operatingCashFlow >= 0 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                    {operatingCashFlow >= 0 ? '🟢 Rentable' : '🟡 Atención'}
                </div>
            </div>

            {/* Grid optimizado con mejor espaciado */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                {/* 1. Medidor de LTV (Existente) - Posición destacada */}
                <div className="md:col-span-1">
                    <RiskGauge
                        value={data?.ltv || 0}
                        low={60}
                        high={80}
                        title="LTV Actual"
                    />
                </div>
                
                {/* 2. KPIs Principales (Existentes) */}
                <MetricCard
                    title="Valor del Portafolio"
                    value={formatCurrency(data?.totalMarketValue)}
                    subtitle="Colateral disponible"
                    icon="💹"
                    color="blue"
                />
                
                <MetricCard
                    title="Deuda Total"
                    value={formatCurrency(data?.totalDebt)}
                    subtitle="Financiamientos activos"
                    icon="💳"
                    color="purple"
                />
                
                {/* 3. Flujo de Caja Operativo - Destacado */}
                <MetricCard
                    title="Flujo de Caja Operativo"
                    value={formatCurrency(operatingCashFlow)}
                    subtitle={`Mes actual (${new Date().toLocaleDateString('es', {month: 'short'})})`}
                    icon={operatingCashFlow >= 0 ? '💚' : '⚠️'}
                    color={operatingCashFlow >= 0 ? 'green' : 'yellow'}
                    trend={operatingCashFlow >= 0 ? 
                        ((operatingCashFlow / (BROKER_INTEREST_EXPENSE_MONTHLY + OPERATING_EXPENSE_MONTHLY)) * 100) : 
                        undefined
                    }
                />
            </div>

            {/* Panel informativo mejorado */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                    <div className="text-blue-600 text-lg">ℹ️</div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Cálculo del Flujo de Caja Operativo</h4>
                        <p className="text-xs text-gray-600 mb-2">
                            <span className="text-green-600 font-medium">${parseFloat(data?.interestIncomeThisMonth || 0).toLocaleString()}</span> (Ingresos por Intereses) - 
                            <span className="text-red-600 font-medium"> ${BROKER_INTEREST_EXPENSE_MONTHLY.toLocaleString()}</span> (Gastos Bróker) - 
                            <span className="text-red-600 font-medium"> ${OPERATING_EXPENSE_MONTHLY.toLocaleString()}</span> (Costos Operativos)
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="text-gray-500">Última actualización: {new Date().toLocaleTimeString()}</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                (data?.ltv || 0) < 60 ? 'bg-green-100 text-green-700' :
                                (data?.ltv || 0) < 80 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                Riesgo LTV: {(data?.ltv || 0) < 60 ? 'BAJO' : (data?.ltv || 0) < 80 ? 'MEDIO' : 'ALTO'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialHealth;
