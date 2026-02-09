import { Request, Response } from 'express';
import { DatabaseConnectionRequest, DatabaseConnectionResponse } from '../types';
import { connectionService } from '../services/database/connection.service';
import { AppError } from '../middleware/error-handler';

export class DatabaseController {
  async connect(req: Request, res: Response): Promise<void> {
    const { type, credentials } = req.body as DatabaseConnectionRequest;

    // Validate input
    if (!type || !credentials) {
      throw new AppError(400, 'Database type and credentials are required');
    }

    // Validate database type
    if (!['postgresql', 'mysql', 'sqlite'].includes(type)) {
      throw new AppError(400, 'Invalid database type');
    }

    // Validate credentials based on type
    if (type === 'sqlite') {
      if (!credentials.path) {
        throw new AppError(400, 'SQLite path is required');
      }
    } else {
      if (!credentials.host || !credentials.database || !credentials.user) {
        throw new AppError(
          400,
          'Host, database, and user are required for PostgreSQL/MySQL'
        );
      }
    }

    try {
      const { adapter, schema } = await connectionService.connect(
        type,
        credentials as any
      );

      const response: DatabaseConnectionResponse = {
        success: true,
        message: `Successfully connected to ${type} database`,
        schema,
      };

      res.json(response);
    } catch (error) {
      throw new AppError(
        500,
        error instanceof Error
          ? error.message
          : `Failed to connect to ${type} database`,
        'CONNECTION_ERROR'
      );
    }
  }

  async disconnect(req: Request, res: Response): Promise<void> {
    const { type } = req.body;

    if (!type) {
      throw new AppError(400, 'Database type is required');
    }

    await connectionService.disconnect(type);

    res.json({
      success: true,
      message: `Disconnected from ${type} database`,
    });
  }
}

export const databaseController = new DatabaseController();
