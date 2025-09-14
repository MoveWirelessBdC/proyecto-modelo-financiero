
export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    nombre_completo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rol_id: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'users',
    timestamps: false
  });
  return User;
};
