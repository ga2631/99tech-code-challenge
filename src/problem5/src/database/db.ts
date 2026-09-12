import Database, { Database as DatabaseType } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

let dbInstance: DatabaseType | null = null;

/**
 * Get or initialize SQLite database connection
 * @param customDbPath Optional custom database path (useful for testing or in-memory DB)
 */
export function getDatabase(customDbPath?: string): DatabaseType {
  if (dbInstance) {
    return dbInstance;
  }

  const targetPath = customDbPath || config.dbPath;

  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  dbInstance = new Database(targetPath);

  // Enable WAL mode (Write-Ahead Logging) for superior concurrency and performance
  if (targetPath !== ':memory:') {
    dbInstance.pragma('journal_mode = WAL');
  }
  dbInstance.pragma('foreign_keys = ON');

  // Initialize Schema
  initSchema(dbInstance);

  return dbInstance;
}

/**
 * Initialize database schema and required indexes
 */
export function initSchema(db: DatabaseType): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
    CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
    CREATE INDEX IF NOT EXISTS idx_resources_price ON resources(price);
    CREATE INDEX IF NOT EXISTS idx_resources_createdAt ON resources(createdAt);
  `);
}

/**
 * Close the current database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
