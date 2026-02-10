import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/env';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!config.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async convertToSQL(
    question: string,
    database: string,
    schema?: object
  ): Promise<string> {
    const prompt = this.buildPrompt(question, database, schema);

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract SQL from response (remove markdown code blocks if present)
    const sql = this.extractSQL(text);

    return sql;
  }

  private buildPrompt(
    question: string,
    database: string,
    schema?: object
  ): string {
    let prompt = `You are an expert SQL query generator. Convert the following natural language question into a valid ${database} SQL query.

IMPORTANT RULES:
1. Return ONLY the SQL query without any explanation or markdown formatting
2. Do not include semicolons at the end
3. Use proper ${database} syntax
4. If the question is ambiguous, make reasonable assumptions`;

    if (schema) {
      prompt += `\n\nDatabase Schema:\n${JSON.stringify(schema, null, 2)}`;
    }

    prompt += `\n\nQuestion: ${question}\n\nSQL Query:`;

    return prompt;
  }

  private extractSQL(text: string): string {
    // Remove markdown code blocks
    let sql = text.trim();

    // Remove ```sql or ``` markers
    sql = sql.replace(/```sql\n?/gi, '');
    sql = sql.replace(/```\n?/g, '');

    // Remove any trailing semicolons
    sql = sql.replace(/;+\s*$/, '');

    return sql.trim();
  }

  async isAvailable(): Promise<boolean> {
    try {
      return !!config.gemini.apiKey;
    } catch {
      return false;
    }
  }
}

export const geminiService = new GeminiService();
