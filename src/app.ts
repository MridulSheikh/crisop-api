import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
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

// Serve static frontend (React or Vite build output)
app.use(express.static(path.join(__dirname, '/app/client')));

// API routes
app.use('/api/v1', allroutes);

// Fallback for React Router (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/app/client', 'index.html'));
});

// Global error handler
app.use(globalErrorHandler);

// Not found (404) middleware
app.use(notFound);

export default app;
