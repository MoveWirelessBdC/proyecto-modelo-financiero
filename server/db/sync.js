import db from '../models/index.js';

const syncDatabase = async () => {
  try {
    // The { alter: true } option will check the current state of the table in the database (which columns it has, what are their data types, etc),
    // and then performs the necessary changes in the table to make it match the model.
    await db.sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing the database:', error);
  } finally {
    await db.sequelize.close();
  }
};

syncDatabase();
