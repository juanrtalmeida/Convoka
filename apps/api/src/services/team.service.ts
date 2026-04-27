import { prisma } from '../db';
import { participantEvents } from './participant.service';

interface RoleRequirements {
  [role: string]: number;
}

export class TeamService {
  static async generateTeams(
    convokaId: string,
    requesterId: string,
    numberOfTeams: number,
    roleRequirements?: RoleRequirements
  ) {
    const convoka = await prisma.convoka.findUnique({
      where: { id: convokaId },
      include: {
        participants: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    if (!convoka || convoka.creatorId !== requesterId) {
      throw new Error('Apenas o criador pode gerenciar os times');
    }

    // 1. Limpar times antigos (Isso também vai setar teamId = null nos participantes devido ao onDelete/onUpdate ou simplesmente podemos atualizar)
    await prisma.participant.updateMany({
      where: { convokaId },
      data: { teamId: null },
    });
    await prisma.team.deleteMany({
      where: { convokaId },
    });

    const participants = [...convoka.participants];

    // 2. Criar os N times no banco (ou em memória e depois salvar)
    const teams = [];
    for (let i = 1; i <= numberOfTeams; i++) {
      const team = await prisma.team.create({
        data: {
          name: `Time ${i}`,
          convokaId,
        },
      });
      teams.push({
        id: team.id,
        name: team.name,
        members: [] as typeof participants,
        totalSkill: 0,
      });
    }

    let unassigned = [...participants];

    // 3. Preencher Requisitos de Roles (Prioridade 1)
    if (roleRequirements) {
      for (const team of teams) {
        for (const [role, count] of Object.entries(roleRequirements)) {
          let filled = 0;
          while (filled < count) {
            // Achar alguém com a role que ainda não tem time
            // Pegar o de maior skill primeiro para garantir as posições chave bem jogadas
            const candidateIndex = unassigned.findIndex((p) => p.roles.includes(role));
            if (candidateIndex !== -1) {
              const p = unassigned[candidateIndex];
              team.members.push(p);
              team.totalSkill += p.skillLevel;
              unassigned.splice(candidateIndex, 1);
              filled++;
            } else {
              break; // Faltou gente com essa role, ignora e segue
            }
          }
        }
      }
    }

    // 4. Distribuir o restante focado em Balanceamento de Skill (Prioridade 2)
    // Ordenar os que sobraram do maior pro menor skill
    unassigned.sort((a, b) => b.skillLevel - a.skillLevel);

    for (const p of unassigned) {
      // Queremos o time que tenha MENOS membros primeiro. 
      // Se houver empate no número de membros, pegamos o time com MENOR totalSkill.
      teams.sort((a, b) => {
        if (a.members.length !== b.members.length) {
          return a.members.length - b.members.length;
        }
        return a.totalSkill - b.totalSkill;
      });

      const targetTeam = teams[0];
      targetTeam.members.push(p);
      targetTeam.totalSkill += p.skillLevel;
    }

    // 5. Salvar as atribuições no banco de dados
    // Podemos fazer updates em lote
    const updatePromises = [];
    for (const team of teams) {
      for (const member of team.members) {
        updatePromises.push(
          prisma.participant.update({
            where: { id: member.id },
            data: { teamId: team.id },
          })
        );
      }
    }

    await Promise.all(updatePromises);

    participantEvents.emit('update', convokaId);

    return teams;
  }

  static async clearTeams(convokaId: string, requesterId: string) {
    const convoka = await prisma.convoka.findUnique({
      where: { id: convokaId },
    });

    if (!convoka || convoka.creatorId !== requesterId) {
      throw new Error('Apenas o criador pode gerenciar os times');
    }

    await prisma.participant.updateMany({
      where: { convokaId },
      data: { teamId: null },
    });
    
    await prisma.team.deleteMany({
      where: { convokaId },
    });

    participantEvents.emit('update', convokaId);
    return { success: true };
  }
}
