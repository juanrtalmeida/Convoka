import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Calendar, Check, LogIn, MapPin, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

interface ParticipantType {
  id: string;
  userId: string;
  status: string;
  roles: string[];
  hasPaid: boolean;
  user?: { name: string };
}

interface ConvokaType {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  maxParticipants?: number;
  allowWaitlist: boolean;
  requireRoles: boolean;
  availableRoles: string[];
  paymentRequired: boolean;
  allowWaitlistPayment: boolean;
  allowParticipantPayment: boolean;
  creatorId: string;
  creator?: { name: string };
  participants: ParticipantType[];
}

export function ConvokaDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const {
    data: convokaData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['convoka', id],
    queryFn: async () => {
      if (!id) throw new Error('ID não fornecido');
      const res = await apiClient.api.convokas[':id'].$get({ param: { id } });
      if (!res.ok) {
        if (res.status === 404) throw new Error('Evento não encontrado');
        throw new Error('Falha ao carregar evento');
      }
      return res.json();
    },
    retry: false,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('ID não fornecido');
      const res = await apiClient.api.participants[':convokaId'].join.$post({
        param: { convokaId: id },
        json: { roles: selectedRoles },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error('error' in err ? err.error : 'Erro ao entrar');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convoka', id] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('ID não fornecido');
      const res = await apiClient.api.participants[':convokaId'].leave.$post({
        param: { convokaId: id },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error('error' in err ? err.error : 'Erro ao sair');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convoka', id] });
    },
  });

  const manageMutation = useMutation({
    mutationFn: async ({
      userId,
      action,
      hasPaid,
    }: {
      userId: string;
      action: string;
      hasPaid?: boolean;
    }) => {
      if (!id) throw new Error('ID não fornecido');
      const res = await apiClient.api.participants[':convokaId'].manage[':userId'].$patch({
        param: { convokaId: id, userId },
        json: { action: action as any, hasPaid },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error('error' in err ? err.error : 'Erro ao gerenciar participante');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convoka', id] });
    },
  });

  useEffect(() => {
    if (!id) return;

    // Inicia a conexão SSE com o backend
    const eventSource = new EventSource(`/api/convokas/${id}/stream`);

    eventSource.onmessage = (event) => {
      if (event.data === 'update') {
        console.log('SSE: Atualização recebida do backend! Atualizando interface...');
        // Refaz a busca dos dados silenciosamente e atualiza a UI
        queryClient.invalidateQueries({ queryKey: ['convoka', id] });
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      // O EventSource tentará reconectar automaticamente
    };

    return () => {
      eventSource.close();
    };
  }, [id, queryClient]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !convokaData || !('convoka' in convokaData)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Ops! Evento não encontrado.</h1>
        <p className="text-slate-500 mb-6">O link pode estar quebrado ou o evento foi cancelado.</p>
        <Link to="/">
          <Button>Ir para a página inicial</Button>
        </Link>
      </div>
    );
  }

  const c = convokaData.convoka as ConvokaType;
  const isCreator = isAuthenticated && user?.id === c.creatorId;
  const isParticipating =
    isAuthenticated && c.participants?.some((p: ParticipantType) => p.userId === user?.id);

  const confirmedParticipants = c.participants?.filter((p: ParticipantType) => p.status === 'CONFIRMED') || [];
  const waitlistParticipants = c.participants?.filter((p: ParticipantType) => p.status === 'WAITLIST') || [];

  const participantsCount = confirmedParticipants.length;
  const isFull = c.maxParticipants ? participantsCount >= c.maxParticipants : false;

  const dateObj = new Date(c.date);
  const formattedDate = format(dateObj, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR });

  const handleJoin = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/c/${id}`);
      return;
    }
    if (c.requireRoles && c.availableRoles?.length > 0 && selectedRoles.length === 0) {
      alert('Por favor, selecione pelo menos um papel para participar deste evento.');
      return;
    }
    joinMutation.mutate();
  };

  const handleLeave = () => {
    if (window.confirm('Tem certeza que deseja cancelar sua presença?')) {
      leaveMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <Link
          to={isAuthenticated ? '/app' : '/'}
          className="flex items-center gap-2 text-primary font-bold"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </Link>
        {!isAuthenticated && (
          <Link to={`/login?redirect=/c/${id}`}>
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
        )}
      </header>

      <main className="max-w-3xl mx-auto p-6 mt-6 space-y-8">
        <div className="space-y-4">
          <div className="inline-flex bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-full items-center gap-2">
            <Calendar size={16} />
            {formattedDate}
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{c.title}</h1>
          <p className="text-lg text-slate-600">
            Organizado por{' '}
            <span className="font-semibold text-slate-900">{c.creator?.name || 'Organizador'}</span>
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <MapPin className="text-slate-500" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Localização</h3>
                    <p className="text-slate-600 mt-1">{c.location || 'A combinar'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Users className="text-slate-500" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Participantes</h3>
                    <p className="text-slate-600 mt-1">
                      {participantsCount} {c.maxParticipants ? `de ${c.maxParticipants}` : ''}{' '}
                      confirmados
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center">
                {isCreator && (
                  <div className="mb-6 p-3 bg-primary/5 rounded-xl border border-primary/20 text-center">
                    <p className="font-semibold text-primary text-sm">👑 Você é o organizador</p>
                  </div>
                )}

                {isParticipating ? (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                      <Check size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">Presença Confirmada!</p>
                      <p className="text-sm text-slate-500 mt-1">Te vemos lá.</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full"
                      onClick={handleLeave}
                      disabled={leaveMutation.isPending}
                    >
                      {leaveMutation.isPending ? 'Cancelando...' : 'Cancelar Presença'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!isAuthenticated ? (
                      <Button className="w-full" size="lg" onClick={handleJoin}>
                        <LogIn className="mr-2" size={18} />
                        Fazer login para entrar
                      </Button>
                    ) : isFull && !c.allowWaitlist ? (
                      <Button className="w-full" size="lg" disabled variant="secondary">
                        Evento Lotado
                      </Button>
                    ) : (
                      <>
                        {c.availableRoles?.length > 0 && (
                          <div className="space-y-3 mb-4 bg-white p-4 rounded-xl border border-slate-200">
                            <label className="text-sm font-medium text-slate-700">
                              Escolha seus papéis {c.requireRoles ? '*' : ''}
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {c.availableRoles.map((role: string) => {
                                const isSelected = selectedRoles.includes(role);
                                return (
                                  <button
                                    key={role}
                                    type="button"
                                    onClick={() => {
                                      setSelectedRoles((prev) =>
                                        isSelected
                                          ? prev.filter((r) => r !== role)
                                          : [...prev, role],
                                      );
                                    }}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                                      isSelected
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/50 hover:bg-primary/5'
                                    }`}
                                  >
                                    {role}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-xs text-slate-500">
                              Você pode selecionar um ou mais papéis.
                            </p>
                          </div>
                        )}
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleJoin}
                          disabled={joinMutation.isPending}
                        >
                          {joinMutation.isPending
                            ? 'Confirmando...'
                            : isFull
                              ? 'Entrar na Lista de Espera'
                              : 'Confirmar Presença'}
                        </Button>
                      </>
                    )}

                    {c.paymentRequired && (
                      <p className="text-xs text-center text-slate-500 font-medium">
                        * Este evento requer pagamento para garantir a vaga.
                      </p>
                    )}
                  </div>
                )}
                {(joinMutation.error || leaveMutation.error) && (
                  <p className="text-sm text-red-500 text-center mt-3">
                    {(joinMutation.error as Error)?.message ||
                      (leaveMutation.error as Error)?.message}
                  </p>
                )}
              </div>
            </div>

            {c.description && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="font-bold text-lg mb-3">Sobre o evento</h3>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {c.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <section className="pt-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">
              Confirmados ({participantsCount}
              {c.maxParticipants ? `/${c.maxParticipants}` : ''})
            </h3>
            {manageMutation.isPending && (
              <span className="text-sm text-primary animate-pulse">Atualizando...</span>
            )}
          </div>

          {participantsCount === 0 ? (
            <p className="text-slate-500 bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center">
              Ninguém confirmou presença ainda. Seja o primeiro!
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {confirmedParticipants.map((p: ParticipantType) => {
                const isMe = p.userId === user?.id;
                return (
                  <div
                    key={p.id}
                    className={`bg-white border rounded-xl p-4 flex flex-col items-center gap-2 text-center relative overflow-hidden transition-all ${isMe ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-slate-200'}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 uppercase ${isMe ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}
                    >
                      {p.user?.name ? p.user.name.charAt(0) : '?'}
                    </div>
                    <div className="w-full">
                      <span className="font-medium text-sm truncate block" title={p.user?.name}>
                        {p.user?.name || 'Usuário'}{' '}
                        {isMe && (
                          <span className="text-primary font-bold text-xs ml-1">(Você)</span>
                        )}
                      </span>

                      {c.paymentRequired && (
                        <div className="mt-1">
                          {p.hasPaid ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              💸 Pago
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                              ⏳ Pendente
                            </span>
                          )}
                        </div>
                      )}

                      {p.roles?.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                          {p.roles.map((role: string) => (
                            <span
                              key={role}
                              className="inline-block bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      )}

                      {isCreator && (
                        <div className="mt-3 flex flex-col gap-1 w-full">
                          {c.paymentRequired && (
                            <button
                              onClick={() =>
                                manageMutation.mutate({
                                  userId: p.userId,
                                  action: 'UPDATE_PAYMENT',
                                  hasPaid: !p.hasPaid,
                                })
                              }
                              className="text-[9px] uppercase tracking-wider font-bold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 py-1.5 rounded transition-colors"
                            >
                              {p.hasPaid ? 'Desfazer Pago' : 'Marcar Pago'}
                            </button>
                          )}
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                manageMutation.mutate({
                                  userId: p.userId,
                                  action: 'MOVE_TO_WAITLIST',
                                })
                              }
                              className="flex-1 text-[9px] uppercase tracking-wider font-bold text-slate-500 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 py-1.5 rounded transition-colors"
                              title="Mover para Fila de Espera"
                            >
                              Espera
                            </button>
                            <button
                              onClick={() =>
                                manageMutation.mutate({ userId: p.userId, action: 'REMOVE' })
                              }
                              className="flex-1 text-[9px] uppercase tracking-wider font-bold text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 py-1.5 rounded transition-colors"
                              title="Expulsar"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {waitlistParticipants.length > 0 && (
          <section className="pt-8">
            <h3 className="font-bold text-lg text-slate-700 mb-4">
              Fila de Espera ({waitlistParticipants.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 opacity-80">
              {waitlistParticipants.map((p: ParticipantType) => {
                const isMe = p.userId === user?.id;
                return (
                  <div
                    key={p.id}
                    className={`bg-slate-50 border rounded-xl p-4 flex flex-col items-center gap-2 text-center ${isMe ? 'border-primary shadow-sm ring-1 ring-primary/30' : 'border-slate-200'}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 uppercase ${isMe ? 'bg-primary/80 text-white' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {p.user?.name ? p.user.name.charAt(0) : '?'}
                    </div>
                    <div className="w-full">
                      <span
                        className="font-medium text-sm truncate block text-slate-700"
                        title={p.user?.name}
                      >
                        {p.user?.name || 'Usuário'}{' '}
                        {isMe && (
                          <span className="text-primary font-bold text-xs ml-1">(Você)</span>
                        )}
                      </span>

                      {isCreator && (
                        <div className="mt-3 flex flex-col gap-1 w-full">
                          <button
                            onClick={() =>
                              manageMutation.mutate({
                                userId: p.userId,
                                action: 'MOVE_TO_CONFIRMED',
                              })
                            }
                            className="text-[9px] uppercase tracking-wider font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary py-1.5 rounded transition-colors"
                          >
                            Aprovar Vaga
                          </button>
                          <button
                            onClick={() =>
                              manageMutation.mutate({ userId: p.userId, action: 'REMOVE' })
                            }
                            className="text-[9px] uppercase tracking-wider font-bold text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 py-1.5 rounded transition-colors border border-slate-200"
                          >
                            Remover
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
