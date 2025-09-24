// dashboard-app/src/pages/DashboardPage.jsx
import React from 'react';
import FinancialHealth from './FinancialHealth';
import PortfolioPerformance from './PortfolioPerformance';
import SalesPerformance from './SalesPerformance'; // Corregido y descomentado

/**
 * El nuevo DashboardPage actúa como un contenedor para las tres zonas especializadas.
 * Cada zona es ahora un componente independiente que se encarga de buscar y mostrar sus propios datos.
 */
const DashboardPage = () => {
    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
            <h1 className="text-3xl font-bold text-white">Centro de Control</h1>
            <FinancialHealth />
            <PortfolioPerformance />
            <SalesPerformance />
        </div>
    );
};

export default DashboardPage;