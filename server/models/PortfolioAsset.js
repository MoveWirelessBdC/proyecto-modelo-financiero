import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const PortfolioAsset = sequelize.define('PortfolioAsset', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ticker_symbol: {
      type: DataTypes.STRING,
    },
    purchase_value: {
      type: DataTypes.DECIMAL(20, 2),
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
    },
    current_market_value: {
      type: DataTypes.DECIMAL(20, 2),
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    asset_type: {
        type: DataTypes.ENUM('Cotizado', 'No Cotizado'),
        allowNull: false,
        defaultValue: 'Cotizado',
        comment: 'Tipo de activo: Cotizado (precio de mercado automático) o No Cotizado (valoración manual)'
    },
    manual_valuation_date: {
        type: DataTypes.DATE,
        comment: 'Fecha de la última valoración manual (para activos no cotizados)'
    },
  }, {
    tableName: 'portfolio_assets',
    timestamps: false,
  });

  return PortfolioAsset;
};