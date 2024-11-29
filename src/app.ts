import express, { Application } from 'express';
import cors from 'cors';
import allroutes from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandlers';
import notFound from './app/middlewares/notfoundError';
const app: Application = express();

// parser
app.use(express.json());
app.use(cors());

// all routes
app.use('/api/v1', allroutes);

app.use(globalErrorHandler);

// Not found route
app.use(notFound);

export default app;
