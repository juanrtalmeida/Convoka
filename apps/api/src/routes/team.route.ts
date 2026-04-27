import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { TeamService } from '../services/team.service';
import { generateTeamsSchema } from '../schemas';
import { authMiddleware, type JwtPayload } from '../middlewares/auth.middleware';

const app = new Hono()
  .post('/:convokaId/generate', authMiddleware, zValidator('json', generateTeamsSchema), async (c) => {
    try {
      const convokaId = c.req.param('convokaId');
      const data = c.req.valid('json');
      const user = c.get('jwtPayload') as JwtPayload;

      const teams = await TeamService.generateTeams(
        convokaId,
        user.sub,
        data.numberOfTeams,
        data.roleRequirements
      );

      return c.json({ teams }, 200);
    } catch (e: unknown) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro desconhecido' }, 400);
    }
  })
  .delete('/:convokaId', authMiddleware, async (c) => {
    try {
      const convokaId = c.req.param('convokaId');
      const user = c.get('jwtPayload') as JwtPayload;

      await TeamService.clearTeams(convokaId, user.sub);
      return c.json({ success: true }, 200);
    } catch (e: unknown) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro desconhecido' }, 400);
    }
  });

export default app;
