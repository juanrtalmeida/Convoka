import { Hono } from 'hono';
import { cors } from 'hono/cors';

import authRoute from './routes/auth.route';
import convokaRoute from './routes/convoka.route';
import participantRoute from './routes/participant.route';

const app = new Hono().basePath('/api');

app.use('*', cors({
  origin: (origin) => origin || '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

// Agrupamento de rotas para exportar os tipos de RPC
const routes = app
  .route('/auth', authRoute)
  .route('/convokas', convokaRoute)
  .route('/participants', participantRoute);

export type AppType = typeof routes;

export default app;
