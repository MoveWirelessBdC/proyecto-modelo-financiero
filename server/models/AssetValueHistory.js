import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AssetValueHistory = sequelize.define('AssetValueHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'portfolio_assets',
        key: 'id',
      },
    },
    market_value: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
    },
    record_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  }, {
    tableName: 'asset_value_history',
    timestamps: false,
  });

  return AssetValueHistory;
};