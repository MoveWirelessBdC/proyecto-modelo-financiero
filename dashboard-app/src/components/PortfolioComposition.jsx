// dashboard-app/src/components/PortfolioComposition.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PortfolioComposition = ({ data, loading, error }) => {
  // Paleta de colores ejecutiva
  const COLORS = [
    '#1f2937', // Gris oscuro
    '#374151', // Gris medio
    '#6b7280', // Gris
    '#9ca3af', // Gris claro
    '#d1d5db', // Gris muy claro
    '#3b82f6', // Azul
    '#6366f1', // Índigo
    '#8b5cf6', // Violeta
  ];

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-6 h-96">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="flex items-center justify-center h-64">
            <div className="w-48 h-48 bg-gray-100 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-6 h-96">
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Sin Composición Disponible</h3>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-6 h-96">
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Portafolio Vacío</h3>
            <p className="text-sm text-gray-500">Añade activos para ver la composición</p>
          </div>
        </div>
      </div>
    );
  }

  // Preparar datos para el gráfico
  const chartData = data.map((asset, index) => ({
    name: asset.name,
    value: parseFloat(asset.value),
    percentage: parseFloat(asset.percentage),
    fill: COLORS[index % COLORS.length]
  }));

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
          <p className="font-medium text-gray-800 mb-2">{data.name}</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Valor:</span>
              <span className="text-sm font-semibold">${data.value.toLocaleString('en-US')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Participación:</span>
              <span className="text-sm font-semibold">{data.percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calcular valor total del portafolio
  const totalValue = chartData.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Composición del Portafolio</h3>
        <p className="text-sm text-gray-500">
          Distribución por activo • Valor Total: ${totalValue.toLocaleString('en-US')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de pastel */}
        <div className="lg:col-span-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de activos */}
        <div className="lg:col-span-1">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {chartData.map((asset, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full border border-white"
                    style={{ backgroundColor: asset.fill }}
                  ></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]" title={asset.name}>
                      {asset.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${asset.value.toLocaleString('en-US')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-800">
                    {asset.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen estadístico */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">{chartData.length}</p>
            <p className="text-xs text-gray-500">Activos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {chartData.length > 0 ? (chartData[0].percentage).toFixed(1) : '0.0'}%
            </p>
            <p className="text-xs text-gray-500">Mayor Posición</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {chartData.length > 0 ? (100 / chartData.length).toFixed(1) : '0.0'}%
            </p>
            <p className="text-xs text-gray-500">Distribución Ideal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioComposition;