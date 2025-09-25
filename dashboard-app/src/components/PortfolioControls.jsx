// dashboard-app/src/components/PortfolioControls.jsx
import React from 'react';

const PortfolioControls = ({ 
  timeRange, 
  onTimeRangeChange, 
  benchmark, 
  onBenchmarkChange, 
  availableBenchmarks = [],
  onRefreshData,
  isRefreshing = false
}) => {
  
  const timeRangeOptions = [
    { value: 30, label: '30 días' },
    { value: 90, label: '3 meses' },
    { value: 180, label: '6 meses' },
    { value: 365, label: '1 año' }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Título */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Centro de Análisis de Portafolio</h2>
          <p className="text-sm text-gray-500">Rendimiento, riesgo y composición en tiempo real</p>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Selector de período */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Período:</label>
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de benchmark */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Benchmark:</label>
            <select
              value={benchmark}
              onChange={(e) => onBenchmarkChange(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableBenchmarks.map(option => (
                <option key={option.symbol} value={option.symbol}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          {/* Botón de actualizar */}
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className={`px-4 py-1.5 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isRefreshing ? (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioControls;