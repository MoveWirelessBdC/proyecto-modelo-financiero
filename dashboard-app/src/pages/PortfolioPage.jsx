// dashboard-app/src/pages/PortfolioPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import PortfolioControls from '../components/PortfolioControls';
import PerformanceChart from '../components/PerformanceChart';
import RiskMetrics from '../components/RiskMetrics';
import PortfolioComposition from '../components/PortfolioComposition';

const PortfolioPage = () => {
    // Estados principales
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    
    // Estados de controles
    const [timeRange, setTimeRange] = useState(90);
    const [selectedBenchmark, setSelectedBenchmark] = useState('SPY');
    const [availableBenchmarks, setAvailableBenchmarks] = useState([]);
    
    // Estados de modales/pestañas
    const [showAssetManagement, setShowAssetManagement] = useState(false);
    const [assets, setAssets] = useState([]);
    const [newAsset, setNewAsset] = useState({ 
        name: '', 
        ticker_symbol: '', 
        purchase_value: '', 
        purchase_date: '',
        asset_type: 'Cotizado',
        current_market_value: '' 
    });

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange, selectedBenchmark]);

    // Función principal para obtener datos del centro de análisis
    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await api.get('/portfolio/analytics', {
                params: { 
                    days: timeRange, 
                    benchmark: selectedBenchmark 
                }
            });
            
            setAnalyticsData(response.data);
            setAvailableBenchmarks(response.data.availableBenchmarks || []);
            
        } catch (err) {
            console.error('Error fetching analytics data:', err);
            setError('No se pudieron cargar los datos de análisis del portafolio.');
        } finally {
            setLoading(false);
        }
    };

    // Función para refrescar datos
    const handleRefreshData = async () => {
        setRefreshing(true);
        await fetchAnalyticsData();
        setRefreshing(false);
    };

    // Obtener activos para gestión
    const fetchAssets = async () => {
        try {
            const response = await api.get('/portfolio/assets');
            setAssets(response.data);
        } catch (err) {
            console.error('Error fetching assets:', err);
        }
    };

    // Gestión de activos
    const handleAddAsset = async (e) => {
        e.preventDefault();
        try {
            await api.post('/portfolio/assets', newAsset);
            await fetchAssets();
            setNewAsset({ name: '', ticker_symbol: '', purchase_value: '', purchase_date: '', asset_type: 'Cotizado', current_market_value: '' });
            
            // Refrescar datos de análisis después de añadir activo
            setTimeout(() => {
                fetchAnalyticsData();
            }, 1000);
            
        } catch (err) {
            console.error('Error adding asset:', err);
            setError('Error al añadir el activo.');
        }
    };

    const handleDeleteAsset = async (id) => {
        try {
            await api.delete(`/portfolio/assets/${id}`);
            await fetchAssets();
            
            // Refrescar datos de análisis después de eliminar activo
            setTimeout(() => {
                fetchAnalyticsData();
            }, 1000);
            
        } catch (err) {
            console.error('Error deleting asset:', err);
            setError('Error al eliminar el activo.');
        }
    };

    // Cargar activos cuando se abre el modal de gestión
    useEffect(() => {
        if (showAssetManagement) {
            fetchAssets();
        }
    }, [showAssetManagement]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAsset(prev => ({ ...prev, [name]: value }));
    };

    // Obtener nombre del benchmark seleccionado
    const selectedBenchmarkName = availableBenchmarks.find(
        b => b.symbol === selectedBenchmark
    )?.name || selectedBenchmark;

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Controles principales */}
            <PortfolioControls
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                benchmark={selectedBenchmark}
                onBenchmarkChange={setSelectedBenchmark}
                availableBenchmarks={availableBenchmarks}
                onRefreshData={handleRefreshData}
                isRefreshing={refreshing}
            />

            {/* Botón de gestión de activos */}
            <div className="mb-6 flex justify-end">
                <button
                    onClick={() => setShowAssetManagement(!showAssetManagement)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Gestionar Activos
                    </div>
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="ml-3 text-sm text-red-800">{error}</p>
                    </div>
                </div>
            )}

            {/* Layout principal del centro de análisis */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                
                {/* Zona 1: Gráfico de rendimiento (2 columnas) */}
                <div className="xl:col-span-2">
                    <PerformanceChart
                        data={analyticsData?.indexedPerformance}
                        loading={loading}
                        error={analyticsData?.indexedPerformance?.message}
                        timeRange={timeRange}
                        benchmarkName={selectedBenchmarkName}
                    />
                </div>

                {/* Zona 2: Composición del portafolio */}
                <div className="xl:col-span-1">
                    <PortfolioComposition
                        data={analyticsData?.composition}
                        loading={loading}
                        error={!analyticsData?.composition?.length ? 'No hay activos en el portafolio' : null}
                    />
                </div>
            </div>

            {/* Zona 3: Métricas de riesgo */}
            <div className="mb-8">
                <RiskMetrics
                    data={analyticsData?.riskMetrics}
                    loading={loading}
                    error={analyticsData?.riskMetrics?.error}
                />
            </div>

            {/* Modal/Panel de gestión de activos */}
            {showAssetManagement && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-800">Gestión de Activos</h2>
                                <button
                                    onClick={() => setShowAssetManagement(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Formulario para añadir activo */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Añadir Nuevo Activo</h3>
                                        <form onSubmit={handleAddAsset}>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nombre del Activo
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={newAsset.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Ej: Apple Inc., Bono del Tesoro"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Símbolo Ticker
                                                </label>
                                                <input
                                                    type="text"
                                                    name="ticker_symbol"
                                                    value={newAsset.ticker_symbol}
                                                    onChange={handleInputChange}
                                                    placeholder="Ej: AAPL, MSFT"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Valor de Compra ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="purchase_value"
                                                    value={newAsset.purchase_value}
                                                    onChange={handleInputChange}
                                                    placeholder="10000"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Fecha de Compra
                                                </label>
                                                <input
                                                    type="date"
                                                    name="purchase_date"
                                                    value={newAsset.purchase_date}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            
                                            {/* Tipo de Activo */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tipo de Activo
                                                </label>
                                                <select
                                                    name="asset_type"
                                                    value={newAsset.asset_type}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="Cotizado">Cotizado (precio automático)</option>
                                                    <option value="No Cotizado">No Cotizado (valoración manual)</option>
                                                </select>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {newAsset.asset_type === 'Cotizado' 
                                                        ? 'El precio se actualizará automáticamente desde fuentes de mercado'
                                                        : 'Deberás actualizar el valor manualmente según valoraciones propias'
                                                    }
                                                </p>
                                            </div>

                                            {/* Valor de Mercado Inicial (solo para No Cotizados) */}
                                            {newAsset.asset_type === 'No Cotizado' && (
                                                <div className="mb-6">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Valor de Mercado Inicial ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="current_market_value"
                                                        value={newAsset.current_market_value}
                                                        onChange={handleInputChange}
                                                        placeholder="10000"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Este valor se usará como valoración inicial del activo
                                                    </p>
                                                </div>
                                            )}
                                            <button 
                                                type="submit"
                                                className="w-full bg-gray-800 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                Añadir Activo
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Lista de activos existentes */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-800">Activos Actuales</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticker</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Compra</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Mercado</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {assets.map(asset => (
                                                        <tr key={asset.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{asset.name}</td>
                                                            <td className="px-6 py-4 text-sm">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    asset.asset_type === 'Cotizado' 
                                                                        ? 'bg-green-100 text-green-800' 
                                                                        : 'bg-orange-100 text-orange-800'
                                                                }`}>
                                                                    {asset.asset_type || 'Cotizado'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">{asset.ticker_symbol || 'N/A'}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                                ${parseFloat(asset.purchase_value || 0).toLocaleString('en-US')}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                                                <div className="flex flex-col">
                                                                    <span>${parseFloat(asset.current_market_value || 0).toLocaleString('en-US')}</span>
                                                                    {asset.asset_type === 'No Cotizado' && asset.manual_valuation_date && (
                                                                        <span className="text-xs text-gray-500">
                                                                            Valorado: {new Date(asset.manual_valuation_date).toLocaleDateString('es-ES')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm">
                                                                <button 
                                                                    onClick={() => handleDeleteAsset(asset.id)}
                                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {assets.length === 0 && (
                                                        <tr>
                                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                                No hay activos en el portafolio
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;