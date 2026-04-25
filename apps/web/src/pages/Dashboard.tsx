import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

interface ConvokaType {
  id: string;
  title: string;
  date: string | Date;
  location?: string | null;
  creatorId: string;
  _count?: { participants: number };
  maxParticipants?: number | null;
  paymentRequired?: boolean;
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-convokas'],
    queryFn: async () => {
      const res = await apiClient.api.convokas.my.$get();
      if (!res.ok) throw new Error('Falha ao carregar os convokas');
      return res.json();
    },
  });

  const convokas = data?.convokas || [];
  const filteredConvokas = convokas.filter((c: ConvokaType) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-primary">Convoka</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 hidden md:inline">
            Olá, {user?.name}
          </span>
          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Meus Convokas</h2>
            <p className="text-slate-500">Eventos que você organiza ou participa.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-64"
            />
            <Link to="/app/create" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full">
                Criar Convoka
              </Button>
            </Link>
          </div>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {error instanceof Error ? error.message : 'Erro ao carregar os dados'}
          </div>
        ) : convokas.length === 0 ? (
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Calendar size={32} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900">Nenhum evento ainda</h3>
                <p className="text-slate-500 mt-1 max-w-sm">
                  Você ainda não tem Convokas. Crie o seu primeiro encontro e chame a galera!
                </p>
              </div>
              <Link to="/app/create" className="mt-2">
                <Button>Criar meu primeiro evento</Button>
              </Link>
            </div>
          </section>
        ) : filteredConvokas.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Nenhum evento encontrado para "{searchTerm}"
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredConvokas.map((c: ConvokaType) => {
              const date = new Date(c.date);
              const formattedDate = new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }).format(date);

              const isCreator = c.creatorId === user?.id;

              return (
                <Link
                  to={`/c/${c.id}`}
                  key={c.id}
                  className="block group rounded-2xl border border-slate-200 bg-white p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">
                      {formattedDate}
                    </div>
                    {isCreator && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        Organizador
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {c.title}
                  </h3>

                  <div className="space-y-2 mt-auto pt-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="truncate">{c.location || 'Sem local definido'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-400" />
                        <span>
                          {c._count?.participants || 0}
                          {c.maxParticipants ? ` / ${c.maxParticipants}` : ''} Confirmados
                        </span>
                      </div>
                      {c.paymentRequired && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">
                          Pago
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
