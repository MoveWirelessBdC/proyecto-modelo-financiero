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
  }, {
    tableName: 'portfolio_assets',
    timestamps: false,
  });

  return PortfolioAsset;
};