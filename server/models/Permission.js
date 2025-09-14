
export default (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    accion: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'permissions',
    timestamps: false
  });
  return Permission;
};
