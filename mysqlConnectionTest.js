require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  let connection;

  try {
    console.log('[TEST] MySQL Connection Test Starting...\n');

    const config = {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
    };

    console.log('[CONFIG] Connection Settings:');
    console.log(`  - Host: ${config.host}`);
    console.log(`  - Port: ${config.port}`);
    console.log(`  - User: ${config.user}`);
    console.log(`  - Database: ${config.database}\n`);

    console.log('[CONNECT] Attempting connection...');
    connection = await mysql.createConnection(config);

    console.log('[SUCCESS] Connection established!\n');

    const [serverVersion] = await connection.query('SELECT VERSION() as version');
    console.log(`[INFO] MySQL Version: ${serverVersion[0].version}`);

    const [databases] = await connection.query('SHOW DATABASES');
    console.log('\n[INFO] Available Databases:');
    databases.forEach((db) => {
      console.log(`  - ${db.Database}`);
    });

    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n[INFO] Tables in '${config.database}' database:`);
    if (tables.length === 0) {
      console.log('  (No tables found)');
    } else {
      tables.forEach((table) => {
        const tableName = table[`Tables_in_${config.database}`];
        console.log(`  - ${tableName}`);
      });
    }

    const [status] = await connection.query('SELECT 1 as connected');
    console.log(`\n[CHECK] Connection Status: ${status[0].connected === 1 ? 'OK' : 'FAIL'}`);

    console.log('\n[DONE] All tests passed!');
  } catch (error) {
    console.error('\n[ERROR] Connection failed:', error.message);
    console.error('\n[HELP] Troubleshooting:');
    console.error('  1. Check if MySQL server is running');
    console.error('  2. Verify .env file settings');
    console.error('  3. Check if port is open');
    console.error('  4. Check firewall settings');

    if (error.code === 'ECONNREFUSED') {
      console.error('\n[HINT] ECONNREFUSED: MySQL server is not running or port is incorrect');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n[HINT] ER_ACCESS_DENIED_ERROR: Username or password is incorrect');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n[HINT] ER_BAD_DB_ERROR: Database does not exist');
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n[CLOSE] Connection closed');
    }
  }
}

testConnection();
