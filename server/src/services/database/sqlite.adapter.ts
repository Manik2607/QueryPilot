import Database from 'better-sqlite3';
import { DatabaseAdapter, SQLiteConfig, TableSchema } from '../../types';

export class SQLiteAdapter implements DatabaseAdapter {
  private db: Database.Database | null = null;
  private config: SQLiteConfig;

  constructor(config: SQLiteConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    this.db = new Database(this.config.path);
    this.db.pragma('journal_mode = WAL');
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async query(sql: string): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const stmt = this.db.prepare(sql);
    const trimmedSql = sql.trim().toUpperCase();
    
    // For SELECT queries, use all() to get rows
    if (trimmedSql.startsWith('SELECT') || trimmedSql.startsWith('SHOW') || 
        trimmedSql.startsWith('DESCRIBE') || trimmedSql.startsWith('EXPLAIN') || 
        trimmedSql.startsWith('PRAGMA')) {
      return stmt.all();
    }
    
    // For INSERT/UPDATE/DELETE, use run() to get metadata
    const result = stmt.run();
    return { 
      affectedRows: result.changes,
      insertId: result.lastInsertRowid 
    } as any;
  }

  async getSchema(): Promise<object> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const tablesResult = this.db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      )
      .all() as { name: string }[];

    const tables: TableSchema[] = [];

    for (const row of tablesResult) {
      const tableName = row.name;
      const columnsResult = this.db
        .prepare(`PRAGMA table_info(${tableName})`)
        .all() as any[];

      tables.push({
        name: tableName,
        columns: columnsResult.map((col: any) => ({
          name: col.name,
          type: col.type,
          nullable: col.notnull === 0,
          primaryKey: col.pk === 1,
        })),
      });
    }

    return { tables };
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.db) {
        await this.connect();
      }
      this.db!.prepare('SELECT 1').get();
      return true;
    } catch {
      return false;
    }
  }
}
