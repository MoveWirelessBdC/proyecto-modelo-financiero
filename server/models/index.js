'use strict';

import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import UserModel from './User.js';
import RoleModel from './Role.js';
import PermissionModel from './Permission.js';

// Configuración para encontrar la ruta del directorio actual en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apuntar dotenv al archivo .env en el directorio superior (la carpeta 'server')
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = UserModel(sequelize, DataTypes);
db.Role = RoleModel(sequelize, DataTypes);
db.Permission = PermissionModel(sequelize, DataTypes);

db.Rol_Permisos = sequelize.define('Rol_Permisos', {
  rol_id: {
    type: DataTypes.INTEGER,
    references: { model: db.Role, key: 'id' }
  },
  permiso_id: {
    type: DataTypes.INTEGER,
    references: { model: db.Permission, key: 'id' }
  }
}, {
  tableName: 'rol_permisos',
  timestamps: false
});

db.User.belongsTo(db.Role, { foreignKey: 'rol_id', as: 'role' });
db.Role.hasMany(db.User, { foreignKey: 'rol_id', as: 'users' });

db.Role.belongsToMany(db.Permission, {
  through: db.Rol_Permisos,
  foreignKey: 'rol_id',
  otherKey: 'permiso_id',
  as: 'permissions'
});

db.Permission.belongsToMany(db.Role, {
  through: db.Rol_Permisos,
  foreignKey: 'permiso_id',
  otherKey: 'rol_id',
  as: 'roles'
});

export default db;
