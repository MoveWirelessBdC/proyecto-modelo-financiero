import db from '../models/index.js';

const listUsers = async () => {
  console.log('--- Diagnostic: Listing all users from the database ---');
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.\n');

    const users = await db.User.findAll({
      include: [{ model: db.Role, as: 'role' }]
    });

    if (users.length === 0) {
      console.log('\nRESULT: The "users" table is empty. No users found.\n');
      console.log('ACTION: Please run the database initialization script and then restart the server.\n');
      console.log('COMMAND: node server/db/init.js\n');
    } else {
      console.log(`
RESULT: Found ${users.length} user(s).\n`);
      users.forEach(user => {
        console.log(
          `  - ID: ${user.id}, Name: ${user.nombre_completo}, Email: ${user.email}, Role: ${user.role ? user.role.nombre_rol : 'No Role'}`
        );
      });
    }
  } catch (error) {
    console.error('\n--- DIAGNOSTIC FAILED ---');
    console.error('Unable to connect to the database or query users:', error);
  } finally {
    await db.sequelize.close();
  }
};

listUsers();