import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../schemas';
import { sign } from 'hono/jwt';

const app = new Hono()
  .post('/register', zValidator('json', registerSchema), async (c) => {
    const data = c.req.valid('json');
    try {
      const user = await AuthService.register(data);
      
      const payload = {
        sub: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 dias
      };
      const secret = process.env.JWT_SECRET || 'convoka-secret-key';
      const token = await sign(payload, secret);

      return c.json({ user, token }, 201);
    } catch (error: unknown) {
      return c.json({ error: error instanceof Error ? error.message : 'Erro desconhecido' }, 400);
    }
  })
  .post('/login', zValidator('json', loginSchema), async (c) => {
    const data = c.req.valid('json');
    try {
      const user = await AuthService.login(data);
      
      const payload = {
        sub: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      };
      const secret = process.env.JWT_SECRET || 'convoka-secret-key';
      const token = await sign(payload, secret);

      return c.json({ user, token }, 200);
    } catch (error: unknown) {
      return c.json({ error: error instanceof Error ? error.message : 'Erro desconhecido' }, 401);
    }
  });

export default app;
