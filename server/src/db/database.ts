import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

// Database file lives in the server folder root
// Excluded from Git via .gitignore (databases are runtime data, not code)
const dbPath = path.join(__dirname, '..', '..', 'articles.db');

// sql.js holds the database in memory and we manually persist to disk.
// This wrapper saves the DB to disk after every write so data isn't lost.
let db: Database;

/**
 * Persists the in-memory database to disk.
 * Called after every INSERT/UPDATE/DELETE.
 */
function saveToDisk() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

/**
 * Initializes the database — loads from disk if it exists,
 * otherwise creates a new one and seeds it.
 */
export async function initDb(): Promise<void> {
  const SQL = await initSqlJs();

  // Load existing database file if it exists, otherwise start fresh
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create the articles table if it doesn't already exist
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      date TEXT NOT NULL,
      publisher TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed sample data on first run so reviewers see a populated UI
  const countResult = db.exec('SELECT COUNT(*) as count FROM articles');
  const count = countResult[0]?.values[0]?.[0] as number;

  if (count === 0) {
    const seedArticles = [
      {
        title: 'EU relaxes food safety requirements for Vietnamese instant noodles',
        summary: 'In the second half of this year, if any food safety violations involving Vietnamese instant noodles are discovered, the EU will include Vietnam vermicelli and rice products in Annex II again, subjecting 50% of the products to control at EU border gates.',
        date: '2026-05-15',
        publisher: 'Saigon Times',
      },
      {
        title: 'Construction Ministry to aid real estate market recovery',
        summary: 'Market watchers suggest that the woes faced by the real estate sector could impact other businesses and the economy as a whole, given the interdependent relationships between real estate, insurance, banking, and securities.',
        date: '2026-05-15',
        publisher: 'Saigon Times',
      },
      {
        title: 'Tech giants face new regulations in Southeast Asia',
        summary: 'Several Southeast Asian governments are introducing new digital regulations targeting major tech platforms operating in their jurisdictions.',
        date: '2026-05-14',
        publisher: 'Tech Asia',
      },
      {
        title: 'Renewable energy investments hit record high',
        summary: 'Global investment in renewable energy reached an all-time high last quarter, driven by solar and wind projects across Asia and Europe.',
        date: '2026-05-13',
        publisher: 'Energy Weekly',
      },
      {
        title: 'AI breakthroughs reshape healthcare diagnostics',
        summary: 'New AI models are dramatically improving early disease detection, with hospitals reporting significant gains in diagnostic accuracy for cancer and cardiovascular conditions.',
        date: '2026-05-12',
        publisher: 'MedTech Today',
      },
    ];

    const stmt = db.prepare(
      'INSERT INTO articles (title, summary, date, publisher) VALUES (?, ?, ?, ?)'
    );
    for (const article of seedArticles) {
      stmt.run([article.title, article.summary, article.date, article.publisher]);
    }
    stmt.free();
    saveToDisk();

    console.log(`Seeded ${seedArticles.length} sample articles into the database`);
  }
}

/**
 * Returns the active database instance.
 * Call initDb() once at server startup before using this.
 */
export function getDb(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

/**
 * Public helper to persist database changes to disk.
 * Routes call this after any write operation.
 */
export { saveToDisk };