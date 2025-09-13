// server/models/Permission.js

// LA CORRECCIÓN ES USAR 'export default'
export default (sequelize, DataTypes) => {
    const Permission = sequelize.define('Permission', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        accion: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        }
    }, {
        timestamps: false,
        tableName: 'Permissions' // Aseguramos el nombre de la tabla
    });
    return Permission;
};