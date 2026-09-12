import Database from 'better-sqlite3';
import path from 'path';

// Connect to SQLite DB
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("Server configuration error: DATABASE_URL missing");
}
const filename = dbUrl.startsWith('file:') ? dbUrl.slice(5) : dbUrl;
const dbPath = path.resolve(process.cwd(), filename);
const db = new Database(dbPath);

// Initialize the Database Table
db.exec(`
  CREATE TABLE IF NOT EXISTS Application (
    id TEXT PRIMARY KEY,
    nullifier TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS Stats (
    id TEXT PRIMARY KEY,
    duplicatesSaved INTEGER DEFAULT 0
  );

  INSERT OR IGNORE INTO Stats (id, duplicatesSaved) VALUES ('singleton', 0);
`);

export default db;
