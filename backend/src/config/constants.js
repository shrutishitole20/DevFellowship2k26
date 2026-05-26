const path = require('path');

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, '..', '..', '..', 'database.db');
const PUBLIC_PATH = path.join(__dirname, '..', '..', '..', 'frontend');

module.exports = {
  PORT,
  DB_PATH,
  PUBLIC_PATH
};
