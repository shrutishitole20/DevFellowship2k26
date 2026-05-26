const CREATE_NOTES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    pinned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

function initSchema(db) {
  return new Promise((resolve, reject) => {
    db.run(CREATE_NOTES_TABLE_SQL, (err) => {
      if (err) {
        console.error('CRITICAL: Failed to initialize database tables:', err.message);
        reject(err);
        return;
      }
      console.log('Database tables successfully initialized.');
      resolve();
    });
  });
}

module.exports = {
  initSchema
};
