import { prisma } from '../db';
export class ConvokaService {
    static async createConvoka(data) {
        return await prisma.convoka.create({
            data: {
                title: data.title,
                description: data.description,
                date: data.date,
                location: data.location,
                maxParticipants: data.maxParticipants,
                allowWaitlist: data.allowWaitlist,
                requireRoles: data.requireRoles,
                paymentRequired: data.paymentRequired,
                allowWaitlistPayment: data.allowWaitlistPayment,
                allowParticipantPayment: data.allowParticipantPayment,
                availableRoles: data.availableRoles,
                creatorId: data.creatorId,
            },
        });
    }
    static async getConvokas() {
        return await prisma.convoka.findMany({
            include: {
                _count: {
                    select: { participants: true },
                },
            },
            orderBy: { date: 'asc' },
        });
    }
    static async getConvokasByUserId(userId) {
        return await prisma.convoka.findMany({
            where: {
                date: { gte: new Date() },
                OR: [
                    { creatorId: userId },
                    { participants: { some: { userId } } }
                ]
            },
            include: {
                _count: { select: { participants: true } }
            },
            orderBy: { date: 'asc' }
        });
    }
    static async getConvokaById(id) {
        return await prisma.convoka.findUnique({
            where: { id },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, name: true } },
                    },
                    orderBy: { joinedAt: 'asc' },
                },
                creator: {
                    select: { id: true, name: true },
                },
            },
        });
    }
}
