export default (sequelize, DataTypes) => {
  const AmortizationSchedule = sequelize.define('AmortizationSchedule', {
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id'
      }
    },
    month_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    monthly_payment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    principal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    interest: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    remaining_balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Pending' // Pending, Paid, Late
    }
  }, {
    tableName: 'amortization_schedule',
    timestamps: false
  });

  return AmortizationSchedule;
};