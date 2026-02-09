import { Request, Response } from 'express';
import { ChatRequest, ChatResponse } from '../types';
import { geminiService } from '../services/ai/gemini.service';
import { connectionService } from '../services/database/connection.service';
import { SqlValidator } from '../services/validation/sql-validator.service';
import { AppError } from '../middleware/error-handler';

export class ChatController {
  async sendMessage(req: Request, res: Response): Promise<void> {
    const { question, database, schema } = req.body as ChatRequest;

    // Validate input
    if (!question || !database) {
      throw new AppError(400, 'Question and database are required');
    }

    // Get database connection
    const adapter = connectionService.getConnection(database);
    if (!adapter) {
      throw new AppError(400, `Not connected to ${database} database`);
    }

    try {
      // Generate SQL using AI
      const sql = await geminiService.convertToSQL(question, database, schema);

      // Validate SQL
      const validation = SqlValidator.validate(sql);
      if (!validation.valid) {
        throw new AppError(
          400,
          'Generated SQL query is not safe',
          'INVALID_SQL',
          { errors: validation.errors }
        );
      }

      // Execute query
      const results = await adapter.query(sql);

      // Format SQL for display
      const formattedSql = SqlValidator.format(sql);

      const response: ChatResponse = {
        sql: formattedSql,
        results: results,
        rowCount: results.length,
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
}

export const chatController = new ChatController();
