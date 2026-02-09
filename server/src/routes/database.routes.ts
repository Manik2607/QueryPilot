import { Router } from 'express';
import { databaseController } from '../controllers/database.controller';
import { asyncHandler } from '../middleware/error-handler';

const router = Router();

// POST /api/databases - Test and establish database connection
router.post(
  '/',
  asyncHandler(databaseController.connect.bind(databaseController))
);

// POST /api/databases/disconnect - Disconnect from database
router.post(
  '/disconnect',
  asyncHandler(databaseController.disconnect.bind(databaseController))
);

export default router;
