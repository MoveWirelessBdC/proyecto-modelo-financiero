// server/services/PortfolioAnalyticsService.js
import db from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';

const { PortfolioAsset, AssetValueHistory, BenchmarkData } = db;

class PortfolioAnalyticsService {
  
  /**
   * Calcula el rendimiento indexado a 100 para el portafolio y benchmark
   */
  static async getIndexedPerformance(days = 90, benchmarkSymbol = 'SPY') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Obtener datos históricos del portafolio
      const portfolioHistory = await AssetValueHistory.findAll({
        where: {
          record_date: {
            [Op.gte]: startDate
          }
        },
        include: [{
          model: PortfolioAsset,
          attributes: ['name', 'purchase_value']
        }],
        order: [['record_date', 'ASC']]
      });

      // Obtener datos históricos del benchmark
      const benchmarkHistory = await BenchmarkData.findAll({
        where: {
          benchmark_symbol: benchmarkSymbol,
          record_date: {
            [Op.gte]: startDate
          }
        },
        order: [['record_date', 'ASC']]
      });

      // Agrupar datos del portafolio por fecha y calcular valor total
      const portfolioByDate = portfolioHistory.reduce((acc, record) => {
        const date = record.record_date;
        if (!acc[date]) acc[date] = 0;
        acc[date] += parseFloat(record.market_value);
        return acc;
      }, {});

      // Convertir a arrays ordenados
      const portfolioDates = Object.keys(portfolioByDate).sort();
      const portfolioValues = portfolioDates.map(date => portfolioByDate[date]);
      
      const benchmarkDates = benchmarkHistory.map(record => record.record_date);
      const benchmarkValues = benchmarkHistory.map(record => parseFloat(record.price));

      // Encontrar fecha de inicio común
      const commonStartDate = portfolioDates[0] > benchmarkDates[0] ? portfolioDates[0] : benchmarkDates[0];
      
      // Filtrar datos desde fecha común
      const filteredPortfolio = portfolioDates
        .map((date, index) => ({ date, value: portfolioValues[index] }))
        .filter(item => item.date >= commonStartDate);
      
      const filteredBenchmark = benchmarkHistory
        .filter(record => record.record_date >= commonStartDate)
        .map(record => ({ date: record.record_date, value: parseFloat(record.price) }));

      // Indexar a 100
      if (filteredPortfolio.length === 0 || filteredBenchmark.length === 0) {
        return { portfolio: [], benchmark: [], message: 'Datos insuficientes para el análisis' };
      }

      const portfolioBaseValue = filteredPortfolio[0].value;
      const benchmarkBaseValue = filteredBenchmark[0].value;

      const indexedPortfolio = filteredPortfolio.map(item => ({
        date: item.date,
        value: (item.value / portfolioBaseValue) * 100
      }));

      const indexedBenchmark = filteredBenchmark.map(item => ({
        date: item.date,
        value: (item.value / benchmarkBaseValue) * 100
      }));

      return {
        portfolio: indexedPortfolio,
        benchmark: indexedBenchmark,
        benchmarkName: benchmarkHistory.length > 0 ? benchmarkHistory[0].benchmark_name : benchmarkSymbol
      };

    } catch (error) {
      console.error('Error calculating indexed performance:', error);
      throw error;
    }
  }

  /**
   * Calcula métricas de riesgo y rendimiento
   */
  static async getRiskMetrics(days = 365, benchmarkSymbol = 'SPY') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Obtener retornos diarios del portafolio
      const portfolioHistory = await AssetValueHistory.findAll({
        attributes: [
          'record_date',
          [fn('SUM', col('market_value')), 'total_value']
        ],
        where: {
          record_date: {
            [Op.gte]: startDate
          }
        },
        group: ['record_date'],
        order: [['record_date', 'ASC']]
      });

      // Obtener retornos diarios del benchmark
      const benchmarkHistory = await BenchmarkData.findAll({
        where: {
          benchmark_symbol: benchmarkSymbol,
          record_date: {
            [Op.gte]: startDate
          }
        },
        order: [['record_date', 'ASC']]
      });

      if (portfolioHistory.length < 2 || benchmarkHistory.length < 2) {
        return { 
          error: 'Datos insuficientes para calcular métricas de riesgo',
          ytdReturn: 0,
          volatility: 0,
          beta: 0,
          bestAsset: null,
          worstAsset: null
        };
      }

      // Calcular retornos diarios del portafolio
      const portfolioReturns = [];
      for (let i = 1; i < portfolioHistory.length; i++) {
        const previousValue = parseFloat(portfolioHistory[i-1].dataValues.total_value);
        const currentValue = parseFloat(portfolioHistory[i].dataValues.total_value);
        const dailyReturn = (currentValue - previousValue) / previousValue;
        portfolioReturns.push(dailyReturn);
      }

      // Calcular retornos diarios del benchmark
      const benchmarkReturns = [];
      for (let i = 1; i < benchmarkHistory.length; i++) {
        const previousPrice = parseFloat(benchmarkHistory[i-1].price);
        const currentPrice = parseFloat(benchmarkHistory[i].price);
        const dailyReturn = (currentPrice - previousPrice) / previousPrice;
        benchmarkReturns.push(dailyReturn);
      }

      // YTD Return (desde inicio del año)
      const yearStart = new Date(new Date().getFullYear(), 0, 1);
      const ytdPortfolio = portfolioHistory.filter(record => 
        new Date(record.record_date) >= yearStart
      );
      
      let ytdReturn = 0;
      if (ytdPortfolio.length >= 2) {
        const startValue = parseFloat(ytdPortfolio[0].dataValues.total_value);
        const endValue = parseFloat(ytdPortfolio[ytdPortfolio.length - 1].dataValues.total_value);
        ytdReturn = ((endValue - startValue) / startValue) * 100;
      }

      // Volatilidad (desviación estándar de retornos)
      const avgReturn = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length;
      const variance = portfolioReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / portfolioReturns.length;
      const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Anualizada

      // Beta (correlación con benchmark)
      let beta = 0;
      if (portfolioReturns.length === benchmarkReturns.length && portfolioReturns.length > 1) {
        const portfolioAvg = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length;
        const benchmarkAvg = benchmarkReturns.reduce((sum, ret) => sum + ret, 0) / benchmarkReturns.length;
        
        let covariance = 0;
        let benchmarkVariance = 0;
        
        for (let i = 0; i < portfolioReturns.length; i++) {
          covariance += (portfolioReturns[i] - portfolioAvg) * (benchmarkReturns[i] - benchmarkAvg);
          benchmarkVariance += Math.pow(benchmarkReturns[i] - benchmarkAvg, 2);
        }
        
        covariance /= portfolioReturns.length;
        benchmarkVariance /= portfolioReturns.length;
        
        beta = benchmarkVariance !== 0 ? covariance / benchmarkVariance : 0;
      }

      // Mejor y peor activo YTD
      const assetPerformance = await this.getAssetPerformanceYTD();

      return {
        ytdReturn: ytdReturn.toFixed(2),
        volatility: volatility.toFixed(2),
        beta: beta.toFixed(2),
        bestAsset: assetPerformance.best,
        worstAsset: assetPerformance.worst
      };

    } catch (error) {
      console.error('Error calculating risk metrics:', error);
      throw error;
    }
  }

  /**
   * Obtiene el rendimiento de activos individuales YTD
   */
  static async getAssetPerformanceYTD() {
    try {
      const yearStart = new Date(new Date().getFullYear(), 0, 1);
      
      const assets = await PortfolioAsset.findAll({
        include: [{
          model: AssetValueHistory,
          where: {
            record_date: {
              [Op.gte]: yearStart
            }
          },
          required: false
        }]
      });

      const assetReturns = assets.map(asset => {
        const history = asset.AssetValueHistories || [];
        if (history.length < 2) {
          return { name: asset.name, return: 0 };
        }
        
        const startValue = parseFloat(history[0].market_value);
        const endValue = parseFloat(history[history.length - 1].market_value);
        const assetReturn = ((endValue - startValue) / startValue) * 100;
        
        return { name: asset.name, return: assetReturn };
      });

      const sortedReturns = assetReturns.sort((a, b) => b.return - a.return);
      
      return {
        best: sortedReturns.length > 0 ? sortedReturns[0] : null,
        worst: sortedReturns.length > 0 ? sortedReturns[sortedReturns.length - 1] : null
      };

    } catch (error) {
      console.error('Error getting asset performance:', error);
      return { best: null, worst: null };
    }
  }

  /**
   * Obtiene la composición actual del portafolio
   */
  static async getPortfolioComposition() {
    try {
      const assets = await PortfolioAsset.findAll({
        attributes: ['name', 'current_market_value']
      });

      const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.current_market_value || 0), 0);
      
      const composition = assets.map(asset => {
        const value = parseFloat(asset.current_market_value || 0);
        return {
          name: asset.name,
          value: value,
          percentage: totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0
        };
      });

      return composition.sort((a, b) => b.value - a.value);

    } catch (error) {
      console.error('Error getting portfolio composition:', error);
      throw error;
    }
  }
}

export default PortfolioAnalyticsService;