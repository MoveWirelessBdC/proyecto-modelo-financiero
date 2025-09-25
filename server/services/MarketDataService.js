// server/services/MarketDataService.js
import axios from 'axios';
import db from '../models/index.js';

const { BenchmarkData } = db;

class MarketDataService {
  
  /**
   * Obtiene datos históricos de un benchmark desde Alpha Vantage
   */
  static async fetchBenchmarkData(symbol, apiKey) {
    try {
      if (!apiKey) {
        throw new Error('API Key de Alpha Vantage no proporcionada');
      }

      console.log(`📊 Obteniendo datos históricos para ${symbol}...`);
      
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          outputsize: 'full', // Para obtener más histórico
          apikey: apiKey
        }
      });

      const data = response.data;
      
      if (data['Error Message']) {
        throw new Error(`Error de API: ${data['Error Message']}`);
      }

      if (data['Note']) {
        throw new Error('Límite de API alcanzado. Intenta más tarde.');
      }

      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('No se encontraron datos de precios para el símbolo');
      }

      // Mapear nombre del benchmark
      const benchmarkNames = {
        'SPY': 'S&P 500',
        'QQQ': 'NASDAQ-100',
        'DIA': 'Dow Jones',
        'IWM': 'Russell 2000',
        'VTI': 'Total Stock Market',
        'VTEB': 'Tax-Exempt Bond',
        'BND': 'Total Bond Market'
      };

      const benchmarkName = benchmarkNames[symbol.toUpperCase()] || symbol.toUpperCase();
      const prices = [];

      // Procesar datos (limitar a últimos 365 días para no sobrecargar)
      const dates = Object.keys(timeSeries).sort().slice(-365);
      
      for (const date of dates) {
        const dayData = timeSeries[date];
        prices.push({
          benchmark_symbol: symbol.toUpperCase(),
          benchmark_name: benchmarkName,
          price: parseFloat(dayData['4. close']),
          volume: parseInt(dayData['5. volume']),
          record_date: date
        });
      }

      return prices;

    } catch (error) {
      console.error(`Error fetching benchmark data for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Actualiza datos de benchmark en la base de datos
   */
  static async updateBenchmarkData(symbol, apiKey) {
    try {
      const prices = await this.fetchBenchmarkData(symbol, apiKey);
      
      // Insertar o actualizar datos (upsert)
      for (const priceData of prices) {
        await BenchmarkData.upsert(priceData, {
          conflictFields: ['benchmark_symbol', 'record_date']
        });
      }

      console.log(`✅ ${prices.length} registros de ${symbol} actualizados en la base de datos`);
      return prices.length;

    } catch (error) {
      console.error(`Error updating benchmark data for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Inicializa datos de benchmarks principales
   */
  static async initializeBenchmarks(apiKey) {
    const benchmarks = ['SPY', 'QQQ', 'DIA']; // Principales índices
    const results = [];

    for (const symbol of benchmarks) {
      try {
        console.log(`🔄 Inicializando ${symbol}...`);
        const count = await this.updateBenchmarkData(symbol, apiKey);
        results.push({ symbol, count, success: true });
        
        // Esperar entre llamadas para respetar límites de API
        await new Promise(resolve => setTimeout(resolve, 12000)); // 12 segundos = 5 llamadas por minuto
        
      } catch (error) {
        console.error(`❌ Error inicializando ${symbol}:`, error.message);
        results.push({ symbol, error: error.message, success: false });
      }
    }

    return results;
  }

  /**
   * Obtiene lista de benchmarks disponibles
   */
  static getAvailableBenchmarks() {
    return [
      { symbol: 'SPY', name: 'S&P 500', description: 'Índice de las 500 empresas más grandes de EE.UU.' },
      { symbol: 'QQQ', name: 'NASDAQ-100', description: 'Las 100 empresas no financieras más grandes del NASDAQ' },
      { symbol: 'DIA', name: 'Dow Jones', description: 'Promedio Industrial Dow Jones (30 empresas)' },
      { symbol: 'IWM', name: 'Russell 2000', description: 'Índice de pequeñas capitalizaciones' },
      { symbol: 'VTI', name: 'Total Stock Market', description: 'Mercado total de valores de EE.UU.' }
    ];
  }
}

export default MarketDataService;