import { useState, useEffect } from 'react';
import api from '../api/api'; // Ya estabas usando api, pero lo confirmo.
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    FunnelChart, 
    Funnel, 
    LabelList, 
    Cell 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];



const SalesPerformance = () => {
    const [pipelineData, setPipelineData] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [pipelineRes, performanceRes] = await Promise.all([
                    api.get('/sales/pipeline'),
                    api.get('/sales/performance-by-salesperson')
                ]);
                
                // Asignamos un color a cada etapa del pipeline para el gráfico
                const pipelineWithColors = pipelineRes.data.map((item, index) => ({
                    ...item,
                    fill: COLORS[index % COLORS.length],
                }));

                setPipelineData(pipelineWithColors);
                setPerformanceData(performanceRes.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching sales performance data');
                // Si hay un error, es útil dejar los gráficos con datos vacíos
                setPipelineData([]);
                setPerformanceData([]);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const formatCurrency = (val) => `$${(val / 1000).toFixed(0)}k`;

    if (loading) {
        return <div className="text-center text-gray-500">Loading Sales Performance...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    const totalPipelineValue = pipelineData?.reduce((acc, stage) => acc + stage.value, 0) || 0;
    const conversionRate = pipelineData && pipelineData.length >= 2 ? 
        (pipelineData[pipelineData.length - 1]?.value / pipelineData[0]?.value * 100) : 0;
    const topPerformer = performanceData && performanceData.length > 0 ? 
        performanceData.reduce((prev, current) => (prev.value > current.value) ? prev : current) : null;

    return (
        <div className="glass-card p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
            {/* Header con métricas de pipeline */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">🎯 Rendimiento Comercial</h2>
                    <p className="text-gray-600 text-sm">Motor de crecimiento del negocio - Desempeño del equipo</p>
                </div>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <div className="bg-green-50 rounded-xl px-4 py-3 border border-green-200">
                        <div className="text-xs text-green-600 mb-1 font-medium">Pipeline Total</div>
                        <div className="text-lg font-bold text-gray-800">
                            {formatCurrency(totalPipelineValue)}
                        </div>
                    </div>
                    {conversionRate > 0 && (
                        <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-200">
                            <div className="text-xs text-blue-600 mb-1 font-medium">Tasa Conversión</div>
                            <div className="text-lg font-bold text-blue-600">
                                {conversionRate.toFixed(1)}%
                            </div>
                        </div>
                    )}
                    {topPerformer && (
                        <div className="bg-orange-50 rounded-xl px-4 py-3 border border-orange-200">
                            <div className="text-xs text-orange-600 mb-1 font-medium">Top Vendedor</div>
                            <div className="text-lg font-bold text-orange-600">
                                {topPerformer.name.split(' ')[0]}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-7 gap-6">
                {/* Embudo de Ventas - Más espacio */}
                <div className="xl:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">📈 Pipeline de Ventas</h3>
                        <p className="text-sm text-gray-600">Flujo de oportunidades por etapa del proceso</p>
                    </div>
                    {pipelineData && pipelineData.length > 0 ? (
                        <div>
                            <ResponsiveContainer width="100%" height={320}>
                                <FunnelChart>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#064e3b', 
                                            border: 'none', 
                                            borderRadius: '0.75rem',
                                            color: '#fff'
                                        }}
                                        formatter={(value) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(value)}
                                    />
                                    <Funnel dataKey="value" data={pipelineData} isAnimationActive>
                                        <LabelList position="center" fill="#ffffff" stroke="none" dataKey="name" fontSize={12} />
                                    </Funnel>
                                </FunnelChart>
                            </ResponsiveContainer>
                            {/* Métricas del embudo */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                {pipelineData.map((stage, index) => (
                                    <div key={index} className="bg-emerald-700/30 rounded-lg p-3 text-center">
                                        <div className="text-xs text-emerald-300 mb-1">{stage.name}</div>
                                        <div className="text-sm font-bold text-white">
                                            {formatCurrency(stage.value)}
                                        </div>
                                        {index > 0 && (
                                            <div className="text-xs text-emerald-400 mt-1">
                                                {((stage.value / pipelineData[0].value) * 100).toFixed(0)}%
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-80 text-emerald-400">
                            <div className="text-center">
                                <div className="text-4xl mb-2">🎯</div>
                                <p>No hay datos de pipeline disponibles</p>
                                <p className="text-xs mt-1">Las métricas se mostrarán cuando haya oportunidades activas</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Performance por Vendedor */}
                <div className="xl:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">👥 Performance Individual</h3>
                        <p className="text-sm text-gray-600">Cartera activa por miembro del equipo</p>
                    </div>
                    {performanceData && performanceData.length > 0 ? (
                        <div>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={performanceData} layout="vertical" margin={{ left: 80 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#059669" opacity={0.3} />
                                    <XAxis type="number" stroke="#6ee7b7" tickFormatter={formatCurrency} fontSize={11} />
                                    <YAxis type="category" dataKey="name" stroke="#6ee7b7" width={80} fontSize={11} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#064e3b', 
                                            border: 'none', 
                                            borderRadius: '0.75rem',
                                            color: '#fff'
                                        }}
                                        formatter={(value) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(value)}
                                    />
                                    <Bar dataKey="value" name="Cartera Activa" radius={4}>
                                        {performanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            {/* Rankings */}
                            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                                {performanceData.map((seller, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm bg-emerald-700/30 rounded-lg p-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                index === 0 ? 'bg-yellow-500 text-yellow-900' :
                                                index === 1 ? 'bg-gray-400 text-gray-900' :
                                                index === 2 ? 'bg-amber-600 text-amber-100' :
                                                'bg-emerald-600 text-emerald-100'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <span className="text-white font-medium">{seller.name}</span>
                                        </div>
                                        <div className="text-emerald-300 font-semibold">
                                            {formatCurrency(seller.value)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-80 text-emerald-400">
                            <div className="text-center">
                                <div className="text-4xl mb-2">👥</div>
                                <p>No hay datos de performance disponibles</p>
                                <p className="text-xs mt-1">Las métricas se mostrarán cuando haya vendedores activos</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Panel de insights y alertas */}
            {pipelineData && pipelineData.length > 0 && performanceData && performanceData.length > 0 && (
                <div className="mt-6 bg-emerald-800/30 rounded-xl p-4 border border-emerald-600/20">
                    <div className="flex items-start gap-3">
                        <div className="text-yellow-400 text-lg">💡</div>
                        <div>
                            <h4 className="text-sm font-semibold text-emerald-300 mb-2">Insights Comerciales</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                                <div>
                                    <span className="text-emerald-400">Total Oportunidades:</span>
                                    <span className="text-white ml-2 font-semibold">{pipelineData.length}</span>
                                </div>
                                <div>
                                    <span className="text-emerald-400">Vendedores Activos:</span>
                                    <span className="text-white ml-2 font-semibold">{performanceData.length}</span>
                                </div>
                                <div>
                                    <span className="text-emerald-400">Promedio por Vendedor:</span>
                                    <span className="text-white ml-2 font-semibold">
                                        {formatCurrency(performanceData.reduce((acc, p) => acc + p.value, 0) / performanceData.length)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-emerald-400">Actualización:</span>
                                    <span className="text-emerald-300 ml-2">{new Date().toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesPerformance;
