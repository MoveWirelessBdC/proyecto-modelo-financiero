// server/models/index.js
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar las funciones que definen los modelos
import User from './User.js';
import Role from './Role.js';
import Permission from './Permission.js';

// Configurar dotenv para encontrar el archivo .env en la carpeta raíz del proyecto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false // Desactivamos los logs de SQL para una salida más limpia
});

const db = {};

// Inicializar los modelos pasándoles la instancia de sequelize
db.User = User(sequelize, DataTypes);
db.Role = Role(sequelize, DataTypes);
db.Permission = Permission(sequelize, DataTypes);

// Definir la tabla de unión (join table)
db.Rol_Permisos = sequelize.define('Rol_Permisos', {}, { timestamps: false });

// Crear las asociaciones entre las tablas
db.Role.belongsToMany(db.Permission, { through: db.Rol_Permisos, foreignKey: 'rol_id' });
db.Permission.belongsToMany(db.Role, { through: db.Rol_Permisos, foreignKey: 'permiso_id' });

// La asociación que ya tenías en el modelo de User, la centralizamos aquí
db.User.belongsTo(db.Role, { foreignKey: 'rol_id' });
db.Role.hasMany(db.User, { foreignKey: 'rol_id' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// LA CORRECCIÓN CLAVE: Exportamos todo el objeto 'db' como el default
export default db;