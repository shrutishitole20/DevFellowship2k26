/**
 * server.js
 * Express.js backend with SQLite persistence for Smart Study Notes Manager.
 * 
 * Provides API endpoints for full CRUD operations and proper static asset serving.
 */

const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.db');

// Middleware
app.use(express.json()); // Parse JSON body payloads
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend static assets

// Initialize SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('CRITICAL: Failed to connect to SQLite database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database at:', DB_PATH);
});

// Create tables with proper constraints
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      pinned INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('CRITICAL: Failed to initialize database tables:', err.message);
      process.exit(1);
    }
    console.log('Database tables successfully initialized.');

    // Check if the table is empty to insert beautiful seed data
    db.get('SELECT COUNT(*) AS count FROM notes', (selectErr, row) => {
      if (!selectErr && row && row.count === 0) {
        console.log('Database is empty. Populating with beautiful seed notes...');
        const seedQuery = `
          INSERT INTO notes (title, content, category, pinned) VALUES 
          (?, ?, ?, ?),
          (?, ?, ?, ?),
          (?, ?, ?, ?)
        `;
        db.run(seedQuery, [
          '📚 Physics II: Electromagnetism Formulas',
          'Key equations to memorize for Midterm:\n- Coulomb\'s Law: F = k * (q1 * q2) / r^2\n- Gauss\'s Law: Φ = Q_enclosed / ε0\n- Ohm\'s Law: V = I * R\n\nMake sure to review spherical shell integration problems on Chapter 23 before Thursday!',
          'Study',
          1,
          '💡 Dynamic JavaScript Closure Concepts',
          'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).\n\nExample:\nfunction makeAdder(x) {\n  return function(y) {\n    return x + y;\n  };\n}\nconst add5 = makeAdder(5);\nconsole.log(add5(2)); // Returns 7',
          'Ideas',
          0,
          '💼 Internship Prep Checklist',
          'Actions for this weekend:\n1. Update Resume with recent Next.js web application accomplishments.\n2. Clean up GitHub profile and pin top 3 repository links.\n3. Send cold message outreach to 5 tech leads on LinkedIn.\n4. Practice 3 coding challenges on Array manipulation.',
          'Work',
          0
        ], (seedErr) => {
          if (seedErr) console.error('Warning: Failed to seed initial database notes:', seedErr.message);
          else console.log('Successfully seeded database with beautiful study samples.');
        });
      }
    });
  });
});

/**
 * DB helper functions wrapped in Promises for modern async/await syntax.
 * Prevents callback hell and allows clean try/catch error handling.
 */
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// ==========================================
// API ROUTES
// ==========================================

/**
 * GET /notes
 * Fetches all study notes.
 * Ordered by pinned status first (pinned=1 at top), then by creation date (newest first).
 */
app.get('/notes', async (req, res, next) => {
  try {
    const query = 'SELECT * FROM notes ORDER BY pinned DESC, created_at DESC';
    const notes = await dbAll(query);
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /notes
 * Creates a new study note.
 * Validates request payload for completeness.
 */
app.post('/notes', async (req, res, next) => {
  try {
    const { title, content, category, pinned } = req.body;

    // Edge Case: Payload validation (missing fields or blank characters)
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required and must not be empty.' });
    }
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Content is required and must not be empty.' });
    }

    const noteCategory = (category && typeof category === 'string' && category.trim()) ? category.trim() : 'General';
    const notePinned = pinned ? 1 : 0;

    const query = `
      INSERT INTO notes (title, content, category, pinned)
      VALUES (?, ?, ?, ?)
    `;
    const result = await dbRun(query, [title.trim(), content.trim(), noteCategory, notePinned]);
    
    // Fetch and return the newly created note
    const newNote = await dbGet('SELECT * FROM notes WHERE id = ?', [result.id]);
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /notes/:id
 * Updates an existing study note (fully or partially, e.g. updating pinned status).
 */
app.put('/notes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category, pinned } = req.body;

    // Check if the note exists in the database
    const existingNote = await dbGet('SELECT * FROM notes WHERE id = ?', [id]);
    if (!existingNote) {
      return res.status(404).json({ error: `Note with ID ${id} not found.` });
    }

    // Capture values or fall back to current values if not provided
    const newTitle = (title !== undefined) ? title : existingNote.title;
    const newContent = (content !== undefined) ? content : existingNote.content;
    const newCategory = (category !== undefined) ? category : existingNote.category;
    const newPinned = (pinned !== undefined) ? (pinned ? 1 : 0) : existingNote.pinned;

    // Edge Case: Validate title and content if they are being updated
    if (title !== undefined && (!title || typeof title !== 'string' || !title.trim())) {
      return res.status(400).json({ error: 'Title cannot be empty.' });
    }
    if (content !== undefined && (!content || typeof content !== 'string' || !content.trim())) {
      return res.status(400).json({ error: 'Content cannot be empty.' });
    }

    const query = `
      UPDATE notes
      SET title = ?, content = ?, category = ?, pinned = ?
      WHERE id = ?
    `;
    await dbRun(query, [
      typeof newTitle === 'string' ? newTitle.trim() : newTitle,
      typeof newContent === 'string' ? newContent.trim() : newContent,
      typeof newCategory === 'string' ? newCategory.trim() : newCategory,
      newPinned,
      id
    ]);

    // Fetch and return the updated note
    const updatedNote = await dbGet('SELECT * FROM notes WHERE id = ?', [id]);
    res.json(updatedNote);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /notes/:id
 * Deletes a study note by ID.
 */
app.delete('/notes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if note exists
    const existingNote = await dbGet('SELECT * FROM notes WHERE id = ?', [id]);
    if (!existingNote) {
      return res.status(404).json({ error: `Note with ID ${id} not found.` });
    }

    await dbRun('DELETE FROM notes WHERE id = ?', [id]);
    res.json({ message: 'Note successfully deleted.', id: parseInt(id, 10) });
  } catch (error) {
    next(error);
  }
});

// Fallback error handler for API routes
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'An internal server error occurred while processing your request.',
    details: err.message
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Smart Study Notes Manager is live!`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
