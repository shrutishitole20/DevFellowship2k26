const { dbAll, dbGet, dbRun } = require('../db/helpers');

function createNotesRepository(db) {
  return {
    getAll: () => dbAll(db, 'SELECT * FROM notes ORDER BY pinned DESC, created_at DESC'),
    getById: (id) => dbGet(db, 'SELECT * FROM notes WHERE id = ?', [id]),
    create: (note) => dbRun(
      db,
      'INSERT INTO notes (title, content, category, pinned) VALUES (?, ?, ?, ?)',
      [note.title, note.content, note.category, note.pinned]
    ),
    update: (id, note) => dbRun(
      db,
      'UPDATE notes SET title = ?, content = ?, category = ?, pinned = ? WHERE id = ?',
      [note.title, note.content, note.category, note.pinned, id]
    ),
    remove: (id) => dbRun(db, 'DELETE FROM notes WHERE id = ?', [id])
  };
}

module.exports = {
  createNotesRepository
};
