// dashboard-app/src/components/PerformanceChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PerformanceChart = ({ data, loading, error, timeRange, benchmarkName }) => {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-8 h-96">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-8 h-96">
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Sin Datos Disponibles</h3>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Combinar datos del portafolio y benchmark por fecha
  const chartData = [];
  const portfolioData = data.portfolio || [];
  const benchmarkData = data.benchmark || [];

  // Crear un mapa de fechas para el benchmark
  const benchmarkMap = benchmarkData.reduce((acc, item) => {
    acc[item.date] = item.value;
    return acc;
  }, {});

  // Combinar los datos
  portfolioData.forEach(portfolioItem => {
    const benchmarkValue = benchmarkMap[portfolioItem.date];
    if (benchmarkValue !== undefined) {
      chartData.push({
        date: portfolioItem.date,
        portfolio: portfolioItem.value,
        benchmark: benchmarkValue,
        formattedDate: new Date(portfolioItem.date).toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric'
        })
      });
    }
  });

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
          <p className="text-sm font-medium text-gray-600 mb-2">{date}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-700">
                  {entry.dataKey === 'portfolio' ? 'Portafolio' : benchmarkName || 'Benchmark'}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {entry.value.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Rendimiento Indexado</h3>
          <p className="text-sm text-gray-500">
            Comparación vs. {benchmarkName || 'Benchmark'} • {timeRange} días • Base 100
          </p>
        </div>
        
        {/* Indicadores de rendimiento */}
        {chartData.length > 0 && (
          <div className="flex gap-4 text-xs">
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Portafolio</span>
              </div>
              <span className="font-semibold text-gray-900">
                {chartData[chartData.length - 1]?.portfolio?.toFixed(1) || '0.0'}
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <span className="text-gray-600">{benchmarkName || 'Benchmark'}</span>
              </div>
              <span className="font-semibold text-gray-900">
                {chartData[chartData.length - 1]?.benchmark?.toFixed(1) || '0.0'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="formattedDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => value.toFixed(0)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="portfolio"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
              name="Portafolio"
            />
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, fill: '#9ca3af' }}
              name={benchmarkName || 'Benchmark'}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Línea base de referencia */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Base 100 = Valor inicial del período</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;