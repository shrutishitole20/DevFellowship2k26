const { createDbConnection } = require('./connection');
const { initSchema } = require('./schema');
const { seedIfEmpty } = require('./seed');

async function initDb() {
  const db = createDbConnection();
  await initSchema(db);
  await seedIfEmpty(db);
  return db;
}

module.exports = {
  initDb
};
