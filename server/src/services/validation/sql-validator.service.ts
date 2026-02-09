import { format } from 'sql-formatter';

export class SqlValidator {
  // Dangerous SQL keywords that should be blocked
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

  // Safe SQL keywords for read-only operations
  private static readonly SAFE_KEYWORDS = ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'];

  static validate(sql: string): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    // Trim and normalize whitespace
    const normalizedSql = sql.trim().toUpperCase();

    if (!normalizedSql) {
      errors.push('SQL query cannot be empty');
      return { valid: false, errors };
    }

    // Check for dangerous keywords
    for (const keyword of this.DANGEROUS_KEYWORDS) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(normalizedSql)) {
        errors.push(`Dangerous operation detected: ${keyword} is not allowed`);
      }
    }

    // Ensure query starts with a safe keyword
    const startsWithSafe = this.SAFE_KEYWORDS.some((keyword) =>
      normalizedSql.startsWith(keyword)
    );

    if (!startsWithSafe) {
      errors.push(
        `Query must start with one of: ${this.SAFE_KEYWORDS.join(', ')}`
      );
    }

    // Check for multiple statements (semicolon followed by more content)
    const statements = sql.split(';').filter((s) => s.trim());
    if (statements.length > 1) {
      errors.push('Multiple SQL statements are not allowed');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
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
