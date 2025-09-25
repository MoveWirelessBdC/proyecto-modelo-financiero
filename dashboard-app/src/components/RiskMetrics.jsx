// dashboard-app/src/components/RiskMetrics.jsx
import React from 'react';

const RiskMetrics = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-6">
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">Error al cargar métricas de riesgo</p>
        </div>
      </div>
    );
  }

  // Función para determinar color basado en valor
  const getColorClass = (value, metric) => {
    const numValue = parseFloat(value);
    
    switch (metric) {
      case 'ytd':
        if (numValue > 10) return 'text-green-600';
        if (numValue > 0) return 'text-green-500';
        if (numValue > -5) return 'text-yellow-600';
        return 'text-red-600';
      
      case 'volatility':
        if (numValue < 10) return 'text-green-600';
        if (numValue < 20) return 'text-yellow-600';
        return 'text-red-600';
      
      case 'beta':
        if (Math.abs(numValue - 1) < 0.2) return 'text-blue-600';
        if (numValue > 1.2) return 'text-red-600';
        return 'text-green-600';
      
      default:
        return 'text-gray-800';
    }
  };

  // Función para obtener icono
  const getIcon = (metric) => {
    switch (metric) {
      case 'ytd':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'volatility':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'beta':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const metrics = [
    {
      key: 'ytd',
      title: 'Rendimiento YTD',
      value: `${data.ytdReturn}%`,
      description: 'Retorno desde inicio del año',
      type: 'ytd'
    },
    {
      key: 'volatility',
      title: 'Volatilidad Anual',
      value: `${data.volatility}%`,
      description: 'Desviación estándar anualizada',
      type: 'volatility'
    },
    {
      key: 'beta',
      title: 'Beta vs. Mercado',
      value: data.beta,
      description: 'Correlación con benchmark',
      type: 'beta'
    },
    {
      key: 'sharpe',
      title: 'Ratio de Sharpe',
      value: 'N/A',
      description: 'Rendimiento ajustado por riesgo',
      type: 'default'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Métricas de Riesgo</h3>
        <p className="text-sm text-gray-500">Análisis de rendimiento y volatilidad</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics.map(metric => (
          <div 
            key={metric.key} 
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                  {getIcon(metric.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{metric.title}</h4>
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-2xl font-bold ${getColorClass(metric.value, metric.type)} mb-1`}>
                {metric.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Información de mejores y peores activos */}
      {(data.bestAsset || data.worstAsset) && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.bestAsset && (
            <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Mejor Activo YTD</h4>
                  <p className="text-sm text-gray-600">{data.bestAsset.name}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-green-600">
                  +{data.bestAsset.return.toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {data.worstAsset && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Peor Activo YTD</h4>
                  <p className="text-sm text-gray-600">{data.worstAsset.name}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-red-600">
                  {data.worstAsset.return.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiskMetrics;