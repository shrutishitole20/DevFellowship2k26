const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../config/constants');

function createDbConnection() {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('CRITICAL: Failed to connect to SQLite database:', err.message);
      process.exit(1);
    }
    console.log('Connected to SQLite database at:', DB_PATH);
  });
}

module.exports = {
  createDbConnection
};
