import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './middleware/error-handler';
import chatRoutes from './routes/chat.routes';
import databaseRoutes from './routes/database.routes';
import validateRoutes from './routes/validate.routes';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });

  // API Routes
  app.use('/api/chat', chatRoutes);
  app.use('/api/databases', databaseRoutes);
  app.use('/api/validate', validateRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: true,
      message: 'Route not found',
      path: req.path,
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
