import { Request, Response } from 'express';
import { ChatRequest, ChatResponse, QueryMode, DatabaseAdapter } from '../types';
import { geminiService } from '../services/ai/gemini.service';
import { connectionService } from '../services/database/connection.service';
import { SqlValidator } from '../services/validation/sql-validator.service';
import { AppError } from '../middleware/error-handler';

/**
 * Extracts the table name from a mutation SQL statement.
 * Supports INSERT INTO, UPDATE, DELETE FROM, CREATE TABLE, DROP TABLE, ALTER TABLE, TRUNCATE.
 */
function extractTableName(sql: string): string | null {
  const normalized = sql.trim();

  // INSERT INTO table_name ...
  const insertMatch = normalized.match(/INSERT\s+INTO\s+[`"']?(\w+)[`"']?/i);
  if (insertMatch) return insertMatch[1];

  // UPDATE table_name SET ...
  const updateMatch = normalized.match(/UPDATE\s+[`"']?(\w+)[`"']?/i);
  if (updateMatch) return updateMatch[1];

  // DELETE FROM table_name ...
  const deleteMatch = normalized.match(/DELETE\s+FROM\s+[`"']?(\w+)[`"']?/i);
  if (deleteMatch) return deleteMatch[1];

  // CREATE TABLE table_name ...
  const createMatch = normalized.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?/i);
  if (createMatch) return createMatch[1];

  // DROP TABLE table_name ...
  const dropMatch = normalized.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?[`"']?(\w+)[`"']?/i);
  if (dropMatch) return dropMatch[1];

  // ALTER TABLE table_name ...
  const alterMatch = normalized.match(/ALTER\s+TABLE\s+[`"']?(\w+)[`"']?/i);
  if (alterMatch) return alterMatch[1];

  // TRUNCATE table_name ...
  const truncateMatch = normalized.match(/TRUNCATE\s+(?:TABLE\s+)?[`"']?(\w+)[`"']?/i);
  if (truncateMatch) return truncateMatch[1];

  return null;
}

/**
 * After executing a mutation, fetches the current table contents to show the user.
 * Returns at most 100 rows. If the table doesn't exist (e.g. after DROP), returns [].
 */
async function fetchTableAfterMutation(
  adapter: DatabaseAdapter,
  tableName: string
): Promise<any[]> {
  try {
    const rows = await adapter.query(`SELECT * FROM ${tableName} LIMIT 100`);
    return Array.isArray(rows) ? rows : [];
  } catch {
    // Table may not exist (e.g. after DROP TABLE), which is fine
    return [];
  }
}

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
      let affectedRowCount: number | undefined;

      if (Array.isArray(results)) {
        // SELECT query - results is array of rows
        resultData = results;
        rowCount = results.length;
      } else if (results && typeof results === 'object') {
        // Modification query - extract affected rows count
        affectedRowCount = (results as any).affectedRows || (results as any).rowCount || 0;

        // Fetch current table state after the mutation
        const tableName = extractTableName(sql);
        if (tableName) {
          resultData = await fetchTableAfterMutation(adapter, tableName);
          rowCount = resultData.length;
        }
      }

      const response: ChatResponse = {
        sql: formattedSql,
        results: resultData,
        rowCount: rowCount,
        affectedRowCount,
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
      let rowCount = 0;
      let resultData: any[] = [];
      let affectedRowCount: number | undefined;

      if (Array.isArray(results)) {
        // SELECT query - results is array of rows
        resultData = results;
        rowCount = results.length;
      } else if (results && typeof results === 'object') {
        // Modification query - extract affected rows count
        affectedRowCount = (results as any).affectedRows || (results as any).rowCount || 0;

        // Fetch current table state after the mutation
        const tableName = extractTableName(sql);
        if (tableName) {
          resultData = await fetchTableAfterMutation(adapter, tableName);
          rowCount = resultData.length;
        }
      }

      const response: ChatResponse = {
        sql: formattedSql,
        results: resultData,
        rowCount: rowCount,
        affectedRowCount,
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
