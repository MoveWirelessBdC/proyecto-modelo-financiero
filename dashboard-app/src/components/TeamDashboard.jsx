// dashboard-app/src/components/TeamDashboard.jsx
import React from 'react';
import MetricCard from './MetricCard'; // Reutilizamos el componente de tarjeta

// --- Mock Data (Datos Ficticios) ---
// En el futuro, esto vendrá de llamadas a la API.
const teamData = {
    commissionsThisMonth: 4520.50,
    pendingOpportunities: 3,
    salesRanking: [
        { name: 'Ana Gómez', value: 120000, isCurrentUser: false },
        { name: 'Tu Rendimiento', value: 95000, isCurrentUser: true },
        { name: 'Carlos Díaz', value: 89000, isCurrentUser: false },
        { name: 'Sofía Loren', value: 76000, isCurrentUser: false },
    ]
};
// -------------------------------------

const formatCurrency = (val) => `$${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TeamDashboard = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-light text-gray-800 mb-12">Tu Dashboard de Ventas</h1>

            {/* KPIs Principales del Vendedor */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                 <MetricCard
                    title="Comisiones del Mes"
                    value={formatCurrency(teamData.commissionsThisMonth)}
                    subtitle="Estimado basado en ventas cerradas"
                    icon="💵"
                    color="green"
                />
                <MetricCard
                    title="Oportunidades Pendientes"
                    value={teamData.pendingOpportunities}
                    subtitle="Esperando aprobación"
                    icon="⏳"
                    color="orange"
                />
            </div>

            {/* Ranking de Ventas */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Ranking de Ventas (Volumen del Mes)</h3>
                <ul className="space-y-4">
                    {teamData.salesRanking.map((member, index) => (
                        <li 
                            key={index} 
                            className={`flex items-center justify-between p-4 rounded-lg ${member.isCurrentUser ? 'bg-indigo-100 border-l-4 border-indigo-500' : 'bg-gray-50'}`}
                        >
                            <div className="flex items-center">
                                <span className={`text-lg font-bold ${member.isCurrentUser ? 'text-indigo-600' : 'text-gray-600'}`}>{index + 1}.</span>
                                <span className={`ml-4 text-lg ${member.isCurrentUser ? 'font-semibold' : 'font-normal'}`}>{member.name}</span>
                            </div>
                            <span className={`text-xl font-medium ${member.isCurrentUser ? 'text-indigo-700' : 'text-gray-800'}`}>
                                {formatCurrency(member.value)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TeamDashboard;
