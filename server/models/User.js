// server/models/User.js

// LA CORRECCIÓN ES USAR 'export default' EN LUGAR DE 'module.exports'
export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre_completo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        }
        // El rol_id ya se define por la asociación en index.js
    });

    return User;
};