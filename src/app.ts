import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import allroutes from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandlers';
import notFound from './app/middlewares/notfoundError';
import config from './app/config';

const app: Application = express();

// Dynamically determine client URL
const client_url =
  config.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : (config.CLIENT_URL as string);

// Middleware: JSON and cookie parser
app.use(express.json());
app.use(cookieParser());

// Enable CORS with credentials
app.use(
  cors({
    origin: [client_url],
    credentials: true,
  })
);

// API routes
app.use('/api/v1', allroutes);


// Global error handler
app.use(globalErrorHandler);

// Not found (404) middleware
app.use(notFound);

export default app;
