import cors from 'cors';
import express from 'express';
import serverless from 'serverless-http';
import api from './routes/api';
import { notFound, errorHandler } from './routes/middleware';

export const app = express();
app.use(cors());
app.use(express.json());

app.use('/', api);

app.use(notFound);
app.use(errorHandler);

export const application = serverless(app, {
  binary: ['*/*'],
});
