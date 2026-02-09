// Type Definitions for QueryPilot Backend

export interface ChatRequest {
  question: string;
  database: string;
  schema?: object;
}

export interface ChatResponse {
  sql: string;
  results: any[];
  rowCount: number;
}

export interface DatabaseConnectionRequest {
  type: 'postgresql' | 'mysql' | 'sqlite';
  credentials: {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    path?: string;
  };
}

export interface DatabaseConnectionResponse {
  success: boolean;
  message: string;
  schema?: object;
}

export interface ValidateRequest {
  sql: string;
  database: string;
}

export interface ValidateResponse {
  valid: boolean;
  errors?: string[];
}

export interface ErrorResponse {
  error: boolean;
  message: string;
  code?: string;
  details?: any;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface SQLiteConfig {
  path: string;
}

export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string): Promise<any[]>;
  getSchema(): Promise<object>;
  testConnection(): Promise<boolean>;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
}
