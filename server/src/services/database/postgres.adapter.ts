import { Pool, PoolClient } from 'pg';
import { DatabaseAdapter, DatabaseConfig, TableSchema } from '../../types';

export class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Test connection
    const client = await this.pool.connect();
    client.release();
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async query(sql: string): Promise<any[]> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const result = await this.pool.query(sql);
    return result.rows;
  }

  async getSchema(): Promise<object> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const tablesResult = await this.pool.query(tablesQuery);
    const tables: TableSchema[] = [];

    for (const row of tablesResult.rows) {
      const tableName = row.table_name;

      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `;

      const columnsResult = await this.pool.query(columnsQuery, [tableName]);

      tables.push({
        name: tableName,
        columns: columnsResult.rows.map((col) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          primaryKey: false,
        })),
      });
    }

    return { tables };
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) {
        await this.connect();
      }
      const result = await this.pool!.query('SELECT 1');
      return result.rows.length > 0;
    } catch {
      return false;
    }
  }
}
