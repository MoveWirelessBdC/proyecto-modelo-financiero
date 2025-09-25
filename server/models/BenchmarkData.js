// server/models/BenchmarkData.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const BenchmarkData = sequelize.define('BenchmarkData', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    benchmark_symbol: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Símbolo del índice: SPY, QQQ, DIA, etc.'
    },
    benchmark_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Nombre del índice: S&P 500, NASDAQ, Dow Jones, etc.'
    },
    price: {
      type: DataTypes.DECIMAL(20, 6),
      allowNull: false,
      comment: 'Precio de cierre del índice'
    },
    record_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha del precio'
    },
    volume: {
      type: DataTypes.BIGINT,
      comment: 'Volumen de transacciones'
    }
  }, {
    tableName: 'benchmark_data',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['benchmark_symbol', 'record_date']
      },
      {
        fields: ['benchmark_symbol']
      },
      {
        fields: ['record_date']
      }
    ]
  });

  return BenchmarkData;
};