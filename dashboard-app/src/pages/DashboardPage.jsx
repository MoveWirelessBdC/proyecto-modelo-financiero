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
        <div className="min-h-screen bg-gray-50">
            {/* Header Principal del Dashboard */}
            <div className="sticky top-0 z-10 backdrop-blur-sm bg-white/95 border-b border-gray-200 shadow-sm">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                                🎯 Centro de Control
                            </h1>
                            <p className="text-gray-600 text-sm md:text-base">
                                Plataforma FinMod Pro - Gestión de Arbitraje Financiero
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center gap-4">
                            <div className="glass-card rounded-xl px-4 py-3 shadow-sm">
                                <div className="text-xs text-gray-500 font-medium">Última actualización</div>
                                <div className="text-sm font-semibold text-gray-800">
                                    {currentTime.toLocaleTimeString('es-ES')}
                                </div>
                            </div>
                            <div className="glass-card rounded-xl px-4 py-3 border-l-4 border-green-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-green-700 text-sm font-medium">Sistema Activo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Container Principal con Espaciado Optimizado */}
            <div className="p-6">
                <div className="max-w-[2000px] mx-auto space-y-8">
                    
                    {/* Zona 1: Salud Financiera */}
                    <div className="smooth-transition hover:-translate-y-1">
                        <FinancialHealth />
                    </div>

                    {/* Zona 2: Rendimiento del Portafolio */}
                    <div className="smooth-transition hover:-translate-y-1">
                        <PortfolioPerformance />
                    </div>

                    {/* Zona 3: Rendimiento Comercial */}
                    <div className="smooth-transition hover:-translate-y-1">
                        <SalesPerformance />
                    </div>

                    {/* Footer Informativo */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="glass-card rounded-2xl p-6 shadow-lg">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        🏛️ Modelo de Negocio: Arbitraje de Tasas de Interés
                                    </h3>
                                    <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
                                        Financiamiento a PyMEs venezolanas mediante apalancamiento inteligente. 
                                        Capital propio como colateral → Acceso a líneas de crédito de margen → 
                                        Préstamos competitivos con margen neto robusto.
                                    </p>
                                </div>
                                <div className="flex gap-3 text-xs">
                                    <div className="gradient-blue text-white px-4 py-2 rounded-lg font-medium">
                                        LTV Target: 60-80%
                                    </div>
                                    <div className="gradient-green text-white px-4 py-2 rounded-lg font-medium">
                                        Flujo Positivo
                                    </div>
                                    <div className="gradient-purple text-white px-4 py-2 rounded-lg font-medium">
                                        Pipeline Activo
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