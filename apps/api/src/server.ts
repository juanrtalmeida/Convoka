import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './index';

const port = Number(process.env.PORT || 8787);

console.log(`🚀 Servidor Node.js rodando em http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
});
