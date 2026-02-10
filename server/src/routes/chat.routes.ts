import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { asyncHandler } from '../middleware/error-handler';

const router = Router();

// POST /api/chat - Send a natural language query
router.post('/', asyncHandler(chatController.sendMessage.bind(chatController)));

// POST /api/chat/execute - Execute a confirmed query
router.post('/execute', asyncHandler(chatController.executeConfirmedQuery.bind(chatController)));

export default router;
