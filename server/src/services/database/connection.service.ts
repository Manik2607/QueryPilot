import { DatabaseAdapter, DatabaseConfig, SQLiteConfig } from '../../types';
import { PostgresAdapter } from './postgres.adapter';
import { MySQLAdapter } from './mysql.adapter';
import { SQLiteAdapter } from './sqlite.adapter';

export class ConnectionService {
  private connections: Map<string, DatabaseAdapter> = new Map();

  async connect(
    type: 'postgresql' | 'mysql' | 'sqlite',
    credentials: DatabaseConfig | SQLiteConfig
  ): Promise<{ adapter: DatabaseAdapter; schema: object }> {
    let adapter: DatabaseAdapter;

    switch (type) {
      case 'postgresql':
        adapter = new PostgresAdapter(credentials as DatabaseConfig);
        break;
      case 'mysql':
        adapter = new MySQLAdapter(credentials as DatabaseConfig);
        break;
      case 'sqlite':
        adapter = new SQLiteAdapter(credentials as SQLiteConfig);
        break;
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }

    await adapter.connect();
    const schema = await adapter.getSchema();

    // Store connection
    this.connections.set(type, adapter);

    return { adapter, schema };
  }

  getConnection(type: string): DatabaseAdapter | undefined {
    return this.connections.get(type);
  }

  async disconnect(type: string): Promise<void> {
    const adapter = this.connections.get(type);
    if (adapter) {
      await adapter.disconnect();
      this.connections.delete(type);
    }
  }

  async disconnectAll(): Promise<void> {
    for (const [type, adapter] of this.connections.entries()) {
      await adapter.disconnect();
    }
    this.connections.clear();
  }
}

export const connectionService = new ConnectionService();
