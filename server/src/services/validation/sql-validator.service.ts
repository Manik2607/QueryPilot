import { format } from 'sql-formatter';
import { QueryMode } from '../../types';

export class SqlValidator {
  // Dangerous SQL keywords that should be blocked in READ_ONLY mode
  private static readonly DANGEROUS_KEYWORDS = [
    'DROP',
    'DELETE',
    'TRUNCATE',
    'ALTER',
    'CREATE',
    'INSERT',
    'UPDATE',
    'GRANT',
    'REVOKE',
    'EXEC',
    'EXECUTE',
  ];

  // Keywords that modify data
  private static readonly MODIFICATION_KEYWORDS = [
    'INSERT',
    'UPDATE',
    'DELETE',
  ];

  // Keywords that alter structure
  private static readonly DDL_KEYWORDS = [
    'DROP',
    'TRUNCATE',
    'ALTER',
    'CREATE',
    'GRANT',
    'REVOKE',
  ];

  // Safe SQL keywords for read-only operations
  private static readonly SAFE_KEYWORDS = ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'];

  static validate(
    sql: string,
    mode: QueryMode = QueryMode.SAFE
  ): { valid: boolean; errors?: string[]; requiresConfirmation?: boolean; queryType?: string } {
    const errors: string[] = [];

    // Trim and normalize whitespace
    const normalizedSql = sql.trim().toUpperCase();

    if (!normalizedSql) {
      errors.push('SQL query cannot be empty');
      return { valid: false, errors };
    }

    // Check for multiple statements (semicolon followed by more content)
    const statements = sql.split(';').filter((s) => s.trim());
    if (statements.length > 1) {
      errors.push('Multiple SQL statements are not allowed');
    }

    // Determine query type
    let queryType = 'unknown';
    let isDangerous = false;
    let isModification = false;

    // Check for DDL operations
    for (const keyword of this.DDL_KEYWORDS) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(normalizedSql)) {
        isDangerous = true;
        queryType = keyword.toLowerCase();
        break;
      }
    }

    // Check for modification operations
    if (!isDangerous) {
      for (const keyword of this.MODIFICATION_KEYWORDS) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(normalizedSql)) {
          isModification = true;
          queryType = keyword.toLowerCase();
          break;
        }
      }
    }

    // Check if it's a read-only query
    if (!isDangerous && !isModification) {
      const startsWithSafe = this.SAFE_KEYWORDS.some((keyword) =>
        normalizedSql.startsWith(keyword)
      );
      if (startsWithSafe) {
        queryType = 'select';
      }
    }

    // Mode-based validation
    switch (mode) {
      case QueryMode.READ_ONLY:
        // Only allow SELECT queries
        if (isDangerous || isModification) {
          errors.push(
            `Operation not allowed in READ-ONLY mode. Only SELECT, SHOW, DESCRIBE, and EXPLAIN queries are permitted.`
          );
        }
        const startsWithSafeReadOnly = this.SAFE_KEYWORDS.some((keyword) =>
          normalizedSql.startsWith(keyword)
        );
        if (!startsWithSafeReadOnly) {
          errors.push(
            `Query must start with one of: ${this.SAFE_KEYWORDS.join(', ')} in READ-ONLY mode`
          );
        }
        break;

      case QueryMode.SAFE:
        // Allow read queries, but require confirmation for dangerous operations
        if (isDangerous) {
          return {
            valid: true,
            requiresConfirmation: true,
            queryType,
          };
        }
        if (isModification) {
          return {
            valid: true,
            requiresConfirmation: true,
            queryType,
          };
        }
        break;

      case QueryMode.FULL_ACCESS:
        // Allow all operations
        // No restrictions, but still validate basic SQL structure
        break;

      default:
        errors.push('Invalid query mode specified');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      queryType,
    };
  }

  static format(sql: string): string {
    try {
      return format(sql, {
        language: 'sql',
        tabWidth: 2,
        keywordCase: 'upper',
      });
    } catch {
      return sql;
    }
  }
}
