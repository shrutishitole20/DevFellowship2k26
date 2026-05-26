const { dbGet, dbRun } = require('./helpers');

const SEED_QUERY = `
  INSERT INTO notes (title, content, category, pinned) VALUES
  (?, ?, ?, ?),
  (?, ?, ?, ?),
  (?, ?, ?, ?)
`;

const SEED_VALUES = [
  'Physics II: Electromagnetism Formulas',
  'Key equations: Coulomb, Gauss, and Ohm. Review shell integration before Thursday.',
  'Study', 1,
  'Dynamic JavaScript Closure Concepts',
  'Closure = function + lexical scope. Example: makeAdder returns a function that keeps x.',
  'Ideas', 0,
  'Internship Prep Checklist',
  'Update resume, polish GitHub, do outreach, and solve array challenges this weekend.',
  'Work', 0
];

async function seedIfEmpty(db) {
  const row = await dbGet(db, 'SELECT COUNT(*) AS count FROM notes');
  if (!row || row.count !== 0) return;
  await dbRun(db, SEED_QUERY, SEED_VALUES);
  console.log('Seeded initial notes data.');
}

module.exports = {
  seedIfEmpty
};
