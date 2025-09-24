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

    return (
        <div className="bg-gray-900 text-white p-4 md:p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-6">Zona de Rendimiento del Portafolio</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de Rendimiento de Activos */}
                <div className="glass-card p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Evolución de Activos</h3>
                     <div className="flex justify-end space-x-2 mb-4">
                        {[30, 90, 365].map(days => (
                            <button 
                                key={days} 
                                onClick={() => setTimeRange(days)}
                                className={`px-3 py-1 text-xs rounded-md ${timeRange === days ? 'bg-blue-600' : 'bg-gray-700'}`}>
                                {days}D
                            </button>
                        ))}
                    </div>
                    {performanceData ? renderLineChart() : <p>No performance data available.</p>}
                </div>

                {/* Tabla de Composición del Portafolio */}
                <div className="glass-card p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Composición del Portafolio</h3>
                    {compositionData ? renderPieChart() : <p>No composition data available.</p>}
                </div>
            </div>
        </div>
    );
};

export default PortfolioPerformance;
