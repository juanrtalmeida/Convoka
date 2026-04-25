import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ParticipantService } from '../services/participant.service';
import { joinConvokaSchema, manageParticipantSchema } from '../schemas';
import { authMiddleware } from '../middlewares/auth.middleware';
const app = new Hono()
    .post('/:convokaId/join', authMiddleware, zValidator('json', joinConvokaSchema), async (c) => {
    const { convokaId } = c.req.param();
    const data = c.req.valid('json');
    const jwtPayload = c.get('jwtPayload');
    try {
        const participant = await ParticipantService.joinConvoka(convokaId, jwtPayload.sub, data.roles);
        return c.json({ participant }, 200);
    }
    catch (e) {
        return c.json({ error: e.message }, 400);
    }
})
    .post('/:convokaId/leave', authMiddleware, async (c) => {
    const { convokaId } = c.req.param();
    const jwtPayload = c.get('jwtPayload');
    try {
        const participant = await ParticipantService.leaveConvoka(convokaId, jwtPayload.sub);
        return c.json({ participant }, 200);
    }
    catch (e) {
        return c.json({ error: e.message }, 400);
    }
})
    .patch('/:convokaId/manage/:userId', authMiddleware, zValidator('json', manageParticipantSchema), async (c) => {
    try {
        const convokaId = c.req.param('convokaId');
        const targetUserId = c.req.param('userId');
        const data = c.req.valid('json');
        const user = c.get('jwtPayload');
        const participant = await ParticipantService.manageParticipant(convokaId, user.sub, targetUserId, data.action, data.hasPaid);
        return c.json({ participant }, 200);
    }
    catch (e) {
        return c.json({ error: e.message }, 400);
    }
});
export default app;
