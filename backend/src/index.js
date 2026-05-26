const { PORT } = require('./config/constants');
const { initDb } = require('./db/initDb');
const { createApp } = require('./app/createApp');

async function startServer() {
  try {
    const db = await initDb();
    const app = createApp(db);
    app.listen(PORT, () => {
      console.log('==================================================');
      console.log('Smart Study Notes Manager is live!');
      console.log(`Server URL: http://localhost:${PORT}`);
      console.log('==================================================');
    });
  } catch (error) {
    console.error('CRITICAL: Failed during server startup:', error.message);
    process.exit(1);
  }
}

startServer();
