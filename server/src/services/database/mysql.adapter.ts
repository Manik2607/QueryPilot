import mysql from 'mysql2/promise';
import { DatabaseAdapter, DatabaseConfig, TableSchema } from '../../types';

export class MySQLAdapter implements DatabaseAdapter {
  private connection: mysql.Connection | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    this.connection = await mysql.createConnection({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  async query(sql: string): Promise<any[]> {
    if (!this.connection) {
      throw new Error('Database not connected');
    }

    const [rows] = await this.connection.query(sql);
    
    // For SELECT queries, rows is an array
    // For INSERT/UPDATE/DELETE, rows is a ResultSetHeader with affectedRows
    // Return the result as-is and let the controller handle the type
    return rows as any[];
  }

  async getSchema(): Promise<object> {
    if (!this.connection) {
      throw new Error('Database not connected');
    }

    const [tablesResult] = await this.connection.query(
      'SHOW TABLES'
    ) as any[];

    const tables: TableSchema[] = [];
    const tableKey = Object.keys(tablesResult[0] || {})[0];

    for (const row of tablesResult) {
      const tableName = row[tableKey];

      const [columnsResult] = await this.connection.query(
        `SHOW COLUMNS FROM ${tableName}`
      ) as any[];

      tables.push({
        name: tableName,
        columns: columnsResult.map((col: any) => ({
          name: col.Field,
          type: col.Type,
          nullable: col.Null === 'YES',
          primaryKey: col.Key === 'PRI',
        })),
      });
    }

    return { tables };
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.connection) {
        await this.connect();
      }
      await this.connection!.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
