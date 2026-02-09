import { Router } from 'express';
import { validateController } from '../controllers/validate.controller';
import { asyncHandler } from '../middleware/error-handler';

const router = Router();

// POST /api/validate - Validate SQL query without executing
router.post(
  '/',
  asyncHandler(validateController.validateQuery.bind(validateController))
);

export default router;
