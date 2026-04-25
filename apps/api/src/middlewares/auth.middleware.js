import { jwt } from 'hono/jwt';
const secret = process.env.JWT_SECRET || 'convoka-secret-key';
export const authMiddleware = jwt({
    secret,
    alg: 'HS256',
});
