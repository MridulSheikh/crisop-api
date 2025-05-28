import express, { Application } from 'express';
import cors from 'cors';
import allroutes from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandlers';
import notFound from './app/middlewares/notfoundError';
import config from './app/config';
import cookieParser from 'cookie-parser';
const app: Application = express();

const client_url = config.NODE_ENV == "development" ? 'http://localhost:3000' : config.CLIENT_URL as string;

// parser
app.use(express.json());
app.use(cookieParser())
app.use(cors({origin: [client_url]}));

// all routes
app.use('/api/v1', allroutes);

app.use(globalErrorHandler);

// Not found route
app.use(notFound);

export default app;
