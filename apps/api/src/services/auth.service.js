import { prisma } from '../db';
import bcrypt from 'bcryptjs';
export class AuthService {
    static async register(data) {
        const existing = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing) {
            throw new Error('E-mail já está em uso.');
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
            },
        });
        return { id: user.id, name: user.name, email: user.email };
    }
    static async login(data) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw new Error('Credenciais inválidas.');
        }
        const isValid = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValid) {
            throw new Error('Credenciais inválidas.');
        }
        return { id: user.id, name: user.name, email: user.email };
    }
}
