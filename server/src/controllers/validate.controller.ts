import { Request, Response } from 'express';
import { ValidateRequest, ValidateResponse } from '../types';
import { SqlValidator } from '../services/validation/sql-validator.service';
import { AppError } from '../middleware/error-handler';

export class ValidateController {
  async validateQuery(req: Request, res: Response): Promise<void> {
    const { sql, database } = req.body as ValidateRequest;

    // Validate input
    if (!sql || !database) {
      throw new AppError(400, 'SQL query and database are required');
    }

    const validation = SqlValidator.validate(sql);

    const response: ValidateResponse = {
      valid: validation.valid,
      errors: validation.errors,
    };

    res.json(response);
  }
}

export const validateController = new ValidateController();
