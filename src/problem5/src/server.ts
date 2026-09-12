import { createApp } from './app';
import { config } from './config';
import { closeDatabase, getDatabase } from './database/db';

const app = createApp();

// Ensure DB is initialized
getDatabase();

const server = app.listen(config.port, () => {
  console.log('====================================================');
  console.log(`🚀 Express CRUD Server is running!`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Local URL:   http://localhost:${config.port}`);
  console.log(`🩺 Healthcheck: http://localhost:${config.port}/health`);
  console.log(`📦 API Prefix:  http://localhost:${config.port}${config.apiPrefix}/resources`);
  console.log('====================================================');
});

// Graceful Shutdown Handlers
function handleShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('🔌 HTTP server closed.');
    closeDatabase();
    console.log('💾 Database connection closed.');
    process.exit(0);
  });

  // Force exit if shutdown hangs
  setTimeout(() => {
    console.error('⚠️ Forcing exit after timeout.');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
