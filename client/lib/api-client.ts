const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export enum QueryMode {
  READ_ONLY = 'read-only',
  SAFE = 'safe',
  FULL_ACCESS = 'full-access',
}

export interface ChatRequest {
  question: string;
  database: string;
  schema?: object;
  mode?: QueryMode;
}

export interface ChatResponse {
  sql: string;
  results: any[];
  rowCount: number;
  requiresConfirmation?: boolean;
  queryType?: string;
}

export interface ExecuteConfirmedRequest {
  sql: string;
  database: string;
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

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async executeConfirmedQuery(
    request: ExecuteConfirmedRequest
  ): Promise<ChatResponse> {
    return this.request<ChatResponse>('/api/chat/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async testDatabaseConnection(
    request: DatabaseConnectionRequest
  ): Promise<DatabaseConnectionResponse> {
    return this.request<DatabaseConnectionResponse>('/api/databases', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async validateQuery(request: ValidateRequest): Promise<ValidateResponse> {
    return this.request<ValidateResponse>('/api/validate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const apiClient = new ApiClient();
