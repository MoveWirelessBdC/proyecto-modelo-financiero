'use strict';

import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import models
import UserModel from './User.js';
import RoleModel from './Role.js';
import PermissionModel from './Permission.js';
import ClientModel from './Client.js';
import ProjectModel from './Project.js';
import AmortizationScheduleModel from './AmortizationSchedule.js';
import PortfolioAssetModel from './PortfolioAsset.js';
import AssetValueHistoryModel from './AssetValueHistory.js';
import BenchmarkDataModel from './BenchmarkData.js';

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

// Initialize models
db.User = UserModel(sequelize, DataTypes);
db.Role = RoleModel(sequelize, DataTypes);
db.Permission = PermissionModel(sequelize, DataTypes);
db.Client = ClientModel(sequelize, DataTypes);
db.Project = ProjectModel(sequelize, DataTypes);
db.AmortizationSchedule = AmortizationScheduleModel(sequelize, DataTypes);
db.PortfolioAsset = PortfolioAssetModel(sequelize, DataTypes);
db.AssetValueHistory = AssetValueHistoryModel(sequelize, DataTypes);
db.BenchmarkData = BenchmarkDataModel(sequelize, DataTypes);

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

// Associations
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

db.Client.belongsTo(db.User, { foreignKey: 'owner_id', as: 'owner' });
db.User.hasMany(db.Client, { foreignKey: 'owner_id' });

db.Project.belongsTo(db.User, { foreignKey: 'created_by_id', as: 'createdBy' });
db.User.hasMany(db.Project, { foreignKey: 'created_by_id' });

db.Project.belongsTo(db.Client, { foreignKey: 'client_id' });
db.Client.hasMany(db.Project, { foreignKey: 'client_id' });

db.Project.hasMany(db.AmortizationSchedule, { foreignKey: 'project_id', as: 'schedule' });
db.AmortizationSchedule.belongsTo(db.Project, { foreignKey: 'project_id' });

// New associations for portfolio
db.PortfolioAsset.hasMany(db.AssetValueHistory, { foreignKey: 'asset_id', as: 'history' });
db.AssetValueHistory.belongsTo(db.PortfolioAsset, { foreignKey: 'asset_id' });

export default db;
