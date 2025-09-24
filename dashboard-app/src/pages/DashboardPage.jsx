// dashboard-app/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import FinancialHealth from './FinancialHealth';
import PortfolioPerformance from './PortfolioPerformance';
import SalesPerformance from './SalesPerformance';

/**
 * Dashboard Principal - Centro de Control Estratégico FinMod Pro
 * Tres zonas especializadas para visión completa del modelo de negocio de arbitraje financiero
 */
const DashboardPage = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Actualizar timestamp cada minuto
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
            {/* Header Principal del Dashboard */}
            <div className="sticky top-0 z-10 backdrop-blur-sm bg-gray-950/80 border-b border-gray-800">
                <div className="p-4 md:p-6 lg:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-green-100 bg-clip-text text-transparent mb-2">
                                🎯 Centro de Control
                            </h1>
                            <p className="text-gray-400 text-sm md:text-base">
                                Plataforma FinMod Pro - Gestión de Arbitraje Financiero
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center gap-4">
                            <div className="bg-gray-800/50 rounded-xl px-4 py-2 border border-gray-700">
                                <div className="text-xs text-gray-400">Última actualización</div>
                                <div className="text-sm font-medium text-white">
                                    {currentTime.toLocaleTimeString('es-ES')}
                                </div>
                            </div>
                            <div className="bg-green-900/30 border border-green-700/50 rounded-xl px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-green-400 text-sm font-medium">Sistema Activo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Container Principal con Espaciado Optimizado */}
            <div className="p-4 md:p-6 lg:p-8">
                <div className="max-w-[2000px] mx-auto space-y-8 md:space-y-12">
                    
                    {/* Zona 1: Salud Financiera */}
                    <div className="transform transition-all duration-300 hover:scale-[1.01] hover:z-10">
                        <FinancialHealth />
                    </div>

                    {/* Zona 2: Rendimiento del Portafolio */}
                    <div className="transform transition-all duration-300 hover:scale-[1.01] hover:z-10">
                        <PortfolioPerformance />
                    </div>

                    {/* Zona 3: Rendimiento Comercial */}
                    <div className="transform transition-all duration-300 hover:scale-[1.01] hover:z-10">
                        <SalesPerformance />
                    </div>

                    {/* Footer Informativo */}
                    <div className="mt-12 pt-8 border-t border-gray-800">
                        <div className="bg-gray-900/30 rounded-2xl p-6 border border-gray-700/30">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        🏛️ Modelo de Negocio: Arbitraje de Tasas de Interés
                                    </h3>
                                    <p className="text-sm text-gray-400 max-w-2xl">
                                        Financiamiento a PyMEs venezolanas mediante apalancamiento inteligente. 
                                        Capital propio como colateral → Acceso a líneas de crédito de margen → 
                                        Préstamos competitivos con margen neto robusto.
                                    </p>
                                </div>
                                <div className="flex gap-3 text-xs">
                                    <div className="bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-700/30">
                                        <span className="text-blue-400">LTV Target: 60-80%</span>
                                    </div>
                                    <div className="bg-green-900/30 px-3 py-2 rounded-lg border border-green-700/30">
                                        <span className="text-green-400">Flujo Positivo</span>
                                    </div>
                                    <div className="bg-purple-900/30 px-3 py-2 rounded-lg border border-purple-700/30">
                                        <span className="text-purple-400">Pipeline Activo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;