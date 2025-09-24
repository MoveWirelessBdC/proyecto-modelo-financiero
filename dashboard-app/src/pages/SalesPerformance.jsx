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

    return (
        <div className="bg-gray-900 text-white p-4 md:p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-6">Zona de Rendimiento Comercial</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Embudo de Ventas */}
                <div className="glass-card p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Embudo de Ventas (Este Trimestre)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <FunnelChart>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                                formatter={(value) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(value)}
                            />
                            <Funnel dataKey="value" data={pipelineData} isAnimationActive>
                                <LabelList position="right" fill="#F9FAFB" stroke="none" dataKey="name" />
                            </Funnel>
                        </FunnelChart>
                    </ResponsiveContainer>
                </div>

                {/* Proyectos Activos por Vendedor */}
                <div className="glass-card p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Cartera Activa por Vendedor</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performanceData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9CA3AF" tickFormatter={formatCurrency} />
                            <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={80} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                                formatter={(value) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(value)}
                            />
                            <Bar dataKey="value" name="Cartera Activa">
                                {performanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SalesPerformance;
