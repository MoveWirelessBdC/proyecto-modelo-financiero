export default (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contact_info: {
      type: DataTypes.STRING
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'clients',
    timestamps: false
  });

  return Client;
};