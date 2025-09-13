// server/models/Role.js

// LA CORRECCIÓN ES USAR 'export default'
export default (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre_rol: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        }
    }, {
        timestamps: false,
        tableName: 'Roles' // Aseguramos el nombre de la tabla
    });
    return Role;
};