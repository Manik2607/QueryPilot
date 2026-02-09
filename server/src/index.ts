import { createApp } from './app';
import { config, validateConfig } from './config/env';
import { connectionService } from './services/database/connection.service';

// Validate configuration
validateConfig();

// Create Express app
const app = createApp();

// Start server
const server = app.listen(config.port, () => {
  console.log('=================================');
  console.log(`QueryPilot Server`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Port: ${config.port}`);
  console.log(`Client URL: ${config.clientUrl}`);
  console.log(`Server started at: ${new Date().toISOString()}`);
  console.log('=================================');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await connectionService.disconnectAll();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await connectionService.disconnectAll();
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(async () => {
    await connectionService.disconnectAll();
    process.exit(1);
  });
});
