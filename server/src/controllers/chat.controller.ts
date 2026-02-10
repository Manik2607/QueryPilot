import { Request, Response } from 'express';
import { ChatRequest, ChatResponse, QueryMode } from '../types';
import { geminiService } from '../services/ai/gemini.service';
import { connectionService } from '../services/database/connection.service';
import { SqlValidator } from '../services/validation/sql-validator.service';
import { AppError } from '../middleware/error-handler';

export class ChatController {
  async sendMessage(req: Request, res: Response): Promise<void> {
    const { question, database, schema, mode } = req.body as ChatRequest;

    // Validate input
    if (!question || !database) {
      throw new AppError(400, 'Question and database are required');
    }

    // Default to SAFE mode if not specified
    const queryMode = mode || QueryMode.SAFE;

    // Get database connection
    const adapter = connectionService.getConnection(database);
    if (!adapter) {
      throw new AppError(400, `Not connected to ${database} database`);
    }

    try {
      // Generate SQL using AI
      const sql = await geminiService.convertToSQL(question, database, schema);

      // Validate SQL with mode
      const validation = SqlValidator.validate(sql, queryMode);
      if (!validation.valid) {
        throw new AppError(
          400,
          'Generated SQL query is not safe',
          'INVALID_SQL',
          { errors: validation.errors }
        );
      }

      // Check if confirmation is required (SAFE mode)
      if (validation.requiresConfirmation) {
        const formattedSql = SqlValidator.format(sql);
        const response: ChatResponse = {
          sql: formattedSql,
          results: [],
          rowCount: 0,
          requiresConfirmation: true,
          queryType: validation.queryType,
        };
        res.json(response);
        return;
      }

      // Execute query
      const results = await adapter.query(sql);

      // Format SQL for display
      const formattedSql = SqlValidator.format(sql);

      // Handle different result types
      let rowCount = 0;
      let resultData: any[] = [];

      if (Array.isArray(results)) {
        // SELECT query - results is array of rows
        resultData = results;
        rowCount = results.length;
      } else if (results && typeof results === 'object') {
        // Modification query - extract affected rows
        rowCount = (results as any).affectedRows || (results as any).rowCount || 0;
        resultData = [];
      }

      const response: ChatResponse = {
        sql: formattedSql,
        results: resultData,
        rowCount: rowCount,
        requiresConfirmation: false,
        queryType: validation.queryType,
      };

      res.json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        500,
        error instanceof Error ? error.message : 'Failed to process query',
        'QUERY_EXECUTION_ERROR'
      );
    }
  }

  async executeConfirmedQuery(req: Request, res: Response): Promise<void> {
    const { sql, database } = req.body;

    // Validate input
    if (!sql || !database) {
      throw new AppError(400, 'SQL and database are required');
    }

    // Get database connection
    const adapter = connectionService.getConnection(database);
    if (!adapter) {
      throw new AppError(400, `Not connected to ${database} database`);
    }

    try {
      // Execute the confirmed query
      const results = await adapter.query(sql);

      // Format SQL for display
      const formattedSql = SqlValidator.format(sql);

      // Handle different result types
      // For SELECT queries, results is an array of rows
      // For INSERT/UPDATE/DELETE, results might be metadata object
      let rowCount = 0;
      let resultData: any[] = [];

      if (Array.isArray(results)) {
        // SELECT query - results is array of rows
        resultData = results;
        rowCount = results.length;
      } else if (results && typeof results === 'object') {
        // Modification query - extract affected rows
        // MySQL uses 'affectedRows', PostgreSQL might use 'rowCount'
        rowCount = (results as any).affectedRows || (results as any).rowCount || 0;
        resultData = [];
      }

      const response: ChatResponse = {
        sql: formattedSql,
        results: resultData,
        rowCount: rowCount,
        requiresConfirmation: false,
      };

      res.json(response);
    } catch (error) {
      throw new AppError(
        500,
        error instanceof Error ? error.message : 'Failed to execute confirmed query',
        'QUERY_EXECUTION_ERROR'
      );
    }
  }
}

export const chatController = new ChatController();
