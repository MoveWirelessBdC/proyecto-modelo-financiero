import { useState, useEffect } from 'react';
import api from '../api/api';
import { 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    PieChart, 
    Pie, 
    Cell, 
    BarChart, 
    Bar, 
    FunnelChart, 
    Funnel, 
    LabelList 
} from 'recharts';

// Colores para los gráficos de pastel y líneas
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

const PortfolioPerformance = () => {
    const [performanceData, setPerformanceData] = useState(null);
    const [compositionData, setCompositionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Hacemos dos llamadas en paralelo para obtener ambos conjuntos de datos
                const [performanceRes, compositionRes] = await Promise.all([
                    api.get(`/portfolio/performance?days=${timeRange}`),
                    api.get(`/portfolio/assets`)
                ]);

                // Procesamos los datos de rendimiento para el gráfico de líneas
                const formattedPerformance = Object.keys(performanceRes.data).map((assetName, index) => ({
                    name: assetName,
                    data: performanceRes.data[assetName],
                    color: COLORS[index % COLORS.length]
                }));
                setPerformanceData(formattedPerformance);

                // Procesamos los datos de composición para el gráfico de pastel
                const formattedComposition = compositionRes.data.map(asset => ({
                    name: asset.name,
                    value: parseFloat(asset.current_market_value)
                }));
                setCompositionData(formattedComposition);

            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching portfolio performance data');
            }
            setLoading(false);
        };

        fetchData();
    }, [timeRange]);

    const renderLineChart = () => (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                    labelStyle={{ color: '#F9FAFB' }}
                />
                <Legend />
                {performanceData.map(series => (
                    <Line type="monotone" dataKey="value" data={series.data} name={series.name} key={series.name} stroke={series.color} strokeWidth={2} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );

    const renderPieChart = () => (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {compositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                    formatter={(value) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(value)}
                />
            </PieChart>
        </ResponsiveContainer>
    );

    if (loading) {
        return <div className="text-center text-gray-500">Loading Portfolio Performance...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    const totalPortfolioValue = compositionData?.reduce((acc, asset) => acc + asset.value, 0) || 0;
    const performanceChange = performanceData?.[0]?.data?.length > 1 ? 
        ((performanceData[0].data[performanceData[0].data.length - 1]?.value - performanceData[0].data[0]?.value) / performanceData[0].data[0]?.value * 100) : 0;

    return (
        <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white p-6 rounded-2xl shadow-2xl border border-blue-800/30">
            {/* Header con métricas de resumen */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">📈 Rendimiento del Portafolio</h2>
                    <p className="text-blue-200 text-sm">Análisis del colateral que respalda la operación</p>
                </div>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <div className="bg-blue-900/50 rounded-xl px-4 py-3 border border-blue-700/30">
                        <div className="text-xs text-blue-300 mb-1">Valor Total</div>
                        <div className="text-lg font-bold text-white">
                            {new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(totalPortfolioValue)}
                        </div>
                    </div>
                    <div className={`rounded-xl px-4 py-3 border ${
                        performanceChange >= 0 
                            ? 'bg-green-900/50 border-green-700/30' 
                            : 'bg-red-900/50 border-red-700/30'
                    }`}>
                        <div className="text-xs text-gray-300 mb-1">Rendimiento ({timeRange}D)</div>
                        <div className={`text-lg font-bold ${performanceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {performanceChange >= 0 ? '+' : ''}{performanceChange.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* Gráfico de Rendimiento de Activos - Más espacio */}
                <div className="xl:col-span-3 bg-slate-800/50 p-6 rounded-xl border border-slate-600/30">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-1">📊 Evolución Histórica</h3>
                            <p className="text-sm text-slate-400">Valor de mercado por activo a lo largo del tiempo</p>
                        </div>
                        <div className="flex space-x-2">
                            {[30, 90, 365].map(days => (
                                <button 
                                    key={days} 
                                    onClick={() => setTimeRange(days)}
                                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                                        timeRange === days 
                                            ? 'bg-blue-600 text-white shadow-lg' 
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}>
                                    {days}D
                                </button>
                            ))}
                        </div>
                    </div>
                    {performanceData && performanceData.length > 0 ? 
                        renderLineChart() : 
                        <div className="flex items-center justify-center h-64 text-slate-400">
                            <div className="text-center">
                                <div className="text-4xl mb-2">📈</div>
                                <p>No hay datos de rendimiento disponibles</p>
                                <p className="text-xs mt-1">Los gráficos se mostrarán cuando haya activos con historial</p>
                            </div>
                        </div>
                    }
                </div>

                {/* Composición del Portafolio */}
                <div className="xl:col-span-2 bg-slate-800/50 p-6 rounded-xl border border-slate-600/30">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-white mb-1">🥧 Composición</h3>
                        <p className="text-sm text-slate-400">Distribución por tipo de activo</p>
                    </div>
                    {compositionData && compositionData.length > 0 ? 
                        <div>
                            {renderPieChart()}
                            {/* Lista detallada de activos */}
                            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                                {compositionData.map((asset, index) => {
                                    const percentage = ((asset.value / totalPortfolioValue) * 100);
                                    return (
                                        <div key={index} className="flex items-center justify-between text-sm bg-slate-700/50 rounded-lg p-2">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-3 h-3 rounded-full" 
                                                    style={{backgroundColor: COLORS[index % COLORS.length]}}
                                                />
                                                <span className="text-white font-medium">{asset.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-slate-300">{percentage.toFixed(1)}%</div>
                                                <div className="text-xs text-slate-400">
                                                    {new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(asset.value)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div> :
                        <div className="flex items-center justify-center h-64 text-slate-400">
                            <div className="text-center">
                                <div className="text-4xl mb-2">🏦</div>
                                <p>No hay activos en el portafolio</p>
                                <p className="text-xs mt-1">Añade activos para ver la composición</p>
                            </div>
                        </div>
                    }
                </div>
            </div>

            {/* Panel de alertas y recomendaciones */}
            {compositionData && compositionData.length > 0 && (
                <div className="mt-6 bg-slate-800/30 rounded-xl p-4 border border-slate-600/20">
                    <div className="flex items-start gap-3">
                        <div className="text-yellow-400 text-lg">⚡</div>
                        <div>
                            <h4 className="text-sm font-semibold text-slate-300 mb-2">Análisis de Diversificación</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400">Total de Activos:</span>
                                    <span className="text-white ml-2 font-semibold">{compositionData.length}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400">Mayor Concentración:</span>
                                    <span className="text-white ml-2 font-semibold">
                                        {((Math.max(...compositionData.map(a => a.value)) / totalPortfolioValue) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400">Actualización:</span>
                                    <span className="text-slate-300 ml-2">{new Date().toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioPerformance;
