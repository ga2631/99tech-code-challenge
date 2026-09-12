import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { globalErrorHandler, notFoundHandler } from './middlewares/errorHandler';
import resourceRoutes from './routes/resourceRoutes';

export function createApp(): Application {
  const app: Application = express();

  // Security headers & CORS
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request body parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // HTTP request logging (suppress in test environment)
  if (config.nodeEnv !== 'test') {
    app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
  }

  // Healthcheck endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
    });
  });

  // API Routes
  app.use(`${config.apiPrefix}/resources`, resourceRoutes);

  // Fallback 404 handler for undefined routes
  app.use(notFoundHandler);

  // Centralized Error Handling Middleware
  app.use(globalErrorHandler);

  return app;
}

export default createApp();
