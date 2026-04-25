import { prisma } from '../db';
import { EventEmitter } from 'events';
export const participantEvents = new EventEmitter();
export class ParticipantService {
    static async joinConvoka(convokaId, userId, roles = []) {
        try {
            console.log(`[joinConvoka] Iniciando para convokaId=${convokaId}, userId=${userId}`);
            // 1. Validar Convoka e vagas
            const convoka = await prisma.convoka.findUnique({
                where: { id: convokaId },
                include: {
                    _count: {
                        select: { participants: { where: { status: 'CONFIRMED' } } },
                    },
                },
            });
            console.log(`[joinConvoka] convoka encontrada:`, !!convoka);
            if (!convoka)
                throw new Error('Convoka não encontrada');
            // 2. Verificar se usuário já está na Convoka
            const existing = await prisma.participant.findUnique({
                where: { userId_convokaId: { userId, convokaId } },
            });
            console.log(`[joinConvoka] existing participant:`, !!existing);
            if (existing)
                throw new Error('Usuário já está na Convoka');
            // 3. Lógica de Vagas
            let status = 'CONFIRMED';
            if (convoka.maxParticipants && convoka._count.participants >= convoka.maxParticipants) {
                if (convoka.allowWaitlist) {
                    status = 'WAITLIST';
                }
                else {
                    throw new Error('Convoka lotada e não permite lista de espera');
                }
            }
            console.log(`[joinConvoka] status do participante:`, status);
            // 4. Criar participante
            const participant = await prisma.participant.create({
                data: {
                    convokaId,
                    userId,
                    status,
                    roles,
                },
            });
            console.log(`[joinConvoka] participante criado com sucesso`);
            // Emitir evento para SSE
            participantEvents.emit('update', convokaId);
            return participant;
        }
        catch (error) {
            console.error(`[joinConvoka] Erro:`, error);
            throw error;
        }
    }
    static async leaveConvoka(convokaId, userId) {
        // 1. Achar e deletar participante atual
        const participant = await prisma.participant.delete({
            where: { userId_convokaId: { userId, convokaId } },
        });
        // 2. Se ele era CONFIRMED, promover o próximo da fila
        if (participant.status === 'CONFIRMED') {
            const nextInLine = await prisma.participant.findFirst({
                where: {
                    convokaId,
                    status: 'WAITLIST',
                },
                orderBy: { joinedAt: 'asc' },
            });
            if (nextInLine) {
                await prisma.participant.update({
                    where: { id: nextInLine.id },
                    data: { status: 'CONFIRMED' },
                });
            }
        }
        participantEvents.emit('update', convokaId);
        return participant;
    }
    static async manageParticipant(convokaId, creatorId, targetUserId, action, hasPaid) {
        const convoka = await prisma.convoka.findUnique({ where: { id: convokaId } });
        if (!convoka || convoka.creatorId !== creatorId) {
            throw new Error('Acesso negado: apenas o organizador pode gerenciar participantes');
        }
        const participant = await prisma.participant.findUnique({
            where: { userId_convokaId: { userId: targetUserId, convokaId } },
        });
        if (!participant)
            throw new Error('Participante não encontrado');
        let result;
        switch (action) {
            case 'UPDATE_PAYMENT':
                if (typeof hasPaid !== 'boolean')
                    throw new Error('Valor hasPaid inválido');
                result = await prisma.participant.update({
                    where: { id: participant.id },
                    data: { hasPaid },
                });
                break;
            case 'MOVE_TO_WAITLIST':
                result = await prisma.participant.update({
                    where: { id: participant.id },
                    data: { status: 'WAITLIST' },
                });
                break;
            case 'MOVE_TO_CONFIRMED':
                result = await prisma.participant.update({
                    where: { id: participant.id },
                    data: { status: 'CONFIRMED' },
                });
                break;
            case 'REMOVE':
                // Usa a própria lógica de leaveConvoka que já puxa o próximo da fila
                result = await this.leaveConvoka(convokaId, targetUserId);
                return result;
            default:
                throw new Error('Ação inválida');
        }
        participantEvents.emit('update', convokaId);
        return result;
    }
}
