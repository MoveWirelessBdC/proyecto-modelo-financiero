export default (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    interest_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    insurance_cost: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0
    },
    sales_commission: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0
    },
    term_months: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_by_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Opportunity' // Oportunidad, Pendiente de Aprobación, Activo, Completado
    }
  }, {
    tableName: 'projects',
    timestamps: false
  });

  return Project;
};