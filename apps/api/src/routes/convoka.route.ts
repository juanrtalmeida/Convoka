import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { zValidator } from '@hono/zod-validator';
import { ConvokaService } from '../services/convoka.service';
import { participantEvents } from '../services/participant.service';
import { createConvokaSchema } from '../schemas';
import { authMiddleware, type JwtPayload } from '../middlewares/auth.middleware';

const app = new Hono()
  .get('/', async (c) => {
    const convokas = await ConvokaService.getConvokas();
    return c.json({ convokas });
  })
  .get('/my', authMiddleware, async (c) => {
    const jwtPayload = c.get('jwtPayload') as JwtPayload;
    const convokas = await ConvokaService.getConvokasByUserId(jwtPayload.sub);
    return c.json({ convokas });
  })
  .get('/:id', async (c) => {
    const { id } = c.req.param();
    const convoka = await ConvokaService.getConvokaById(id);
    if (!convoka) return c.json({ error: 'Not found' }, 404);
    return c.json({ convoka });
  })
  .post('/', authMiddleware, zValidator('json', createConvokaSchema), async (c) => {
    const data = c.req.valid('json');
    const jwtPayload = c.get('jwtPayload') as JwtPayload;
    
    try {
      const convoka = await ConvokaService.createConvoka({
        ...data,
        creatorId: jwtPayload.sub
      });
      return c.json({ convoka }, 201);
    } catch (e: unknown) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro desconhecido' }, 400);
    }
  })
  .get('/:id/stream', async (c) => {
    const id = c.req.param('id');
    
    return streamSSE(c, async (stream) => {
      let isConnected = true;

      // Se a conexão for fechada pelo cliente
      stream.onAbort(() => {
        isConnected = false;
      });

      // Envia uma mensagem inicial para conectar
      await stream.writeSSE({
        data: 'connected',
        event: 'init',
      });

      const onUpdate = async (updatedConvokaId: string) => {
        if (!isConnected) return;
        if (updatedConvokaId === id) {
          try {
            await stream.writeSSE({
              data: 'update',
              event: 'message',
            });
          } catch (e) {
            isConnected = false;
          }
        }
      };

      // Inscrever-se no EventEmitter global
      participantEvents.on('update', onUpdate);

      // Manter a conexão viva (ping a cada 30s)
      const interval = setInterval(async () => {
        if (!isConnected) {
          clearInterval(interval);
          participantEvents.off('update', onUpdate);
          return;
        }
        try {
          await stream.writeSSE({ data: 'ping', event: 'ping' });
        } catch (e) {
          isConnected = false;
        }
      }, 30000);

      // Um loop infinito simples que cede a vez ao event loop,
      // pois o Cloudflare Workers/Node mata o stream se a função async terminar.
      while (isConnected) {
        await stream.sleep(1000);
      }
      
      clearInterval(interval);
      participantEvents.off('update', onUpdate);
    });
  });

export default app;
