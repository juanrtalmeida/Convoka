import { ptBR } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Calendar } from '../components/ui/Calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { apiClient } from '../services/api';

export function CreateConvoka() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    maxParticipants: '',
    allowWaitlist: false,
    requireRoles: false,
    paymentRequired: false,
    allowWaitlistPayment: false,
    allowParticipantPayment: true,
    availableRoles: [] as string[],
  });

  const [roleInput, setRoleInput] = useState('');

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('19:00');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddRole = () => {
    if (roleInput.trim() && !formData.availableRoles.includes(roleInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        availableRoles: [...prev.availableRoles, roleInput.trim()],
      }));
      setRoleInput('');
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      availableRoles: prev.availableRoles.filter((r) => r !== roleToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedDate) {
      setError('Por favor, selecione uma data no calendário.');
      setLoading(false);
      return;
    }

    const [hours, minutes] = time.split(':');
    const finalDate = new Date(selectedDate);
    finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const isoDate = finalDate.toISOString();

    try {
      const res = await apiClient.api.convokas.$post({
        json: {
          ...formData,
          date: isoDate,
          maxParticipants: formData.maxParticipants
            ? parseInt(formData.maxParticipants)
            : undefined,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error('error' in data ? data.error : 'Erro ao criar evento');
      }

      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          to="/app"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o Dashboard
        </Link>

        <Card className="shadow-xl shadow-slate-200/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Criar novo Convoka</CardTitle>
            <CardDescription>Preencha os dados básicos do seu encontro ou evento.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Título do Encontro *</label>
                  <Input
                    name="title"
                    placeholder="Ex: Futebol de Quarta"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Descrição</label>
                  <textarea
                    name="description"
                    className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                    placeholder="Detalhes adicionais sobre o evento..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col relative" id="calendar-container">
                    <label className="text-sm font-medium text-slate-700">Data *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const container = document.getElementById('calendar-popover');
                        if (container) container.classList.toggle('hidden');
                      }}
                      className={`flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary ${!selectedDate ? 'text-slate-500' : 'text-slate-900'}`}
                    >
                      {selectedDate
                        ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(
                            selectedDate,
                          )
                        : 'Selecione uma data'}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-50"
                      >
                        <path d="M8 2v4" />
                        <path d="M16 2v4" />
                        <rect width="18" height="18" x="3" y="4" rx="2" />
                        <path d="M3 10h18" />
                      </svg>
                    </button>

                    <div id="calendar-popover" className="hidden absolute top-[70px] left-0 z-50">
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                          const container = document.getElementById('calendar-popover');
                          if (container) container.classList.add('hidden');
                        }}
                      ></div>
                      <div className="relative z-50">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            const container = document.getElementById('calendar-popover');
                            if (container) container.classList.add('hidden');
                          }}
                          disabled={{ before: new Date() }}
                          locale={ptBR}
                          className="bg-white rounded-2xl shadow-xl border border-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Hora *</label>
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Localização</label>
                      <Input
                        name="location"
                        placeholder="Ex: Quadra 3, Clube X"
                        value={formData.location}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Máximo de Participantes
                      </label>
                      <Input
                        type="number"
                        name="maxParticipants"
                        placeholder="Ex: 14 (Deixe vazio para ilimitado)"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">Configurações Avançadas</h3>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="allowWaitlist"
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      checked={formData.allowWaitlist}
                      onChange={handleChange}
                    />
                    <div>
                      <span className="block text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        Permitir Lista de Espera
                      </span>
                      <span className="block text-sm text-slate-500">
                        Pessoas podem entrar na fila caso o evento lote.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="paymentRequired"
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      checked={formData.paymentRequired}
                      onChange={handleChange}
                    />
                    <div>
                      <span className="block text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        Pagamento Obrigatório
                      </span>
                      <span className="block text-sm text-slate-500">
                        Exigir pagamento (Pix/Cartão) para confirmar a vaga.
                      </span>
                    </div>
                  </label>

                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900">Papéis / Cargos</h3>
                    <p className="text-sm text-slate-500">
                      Crie opções para os participantes escolherem (ex: Goleiro, Defesa, Levar
                      Bebida).
                    </p>

                    <div className="flex gap-2">
                      <Input
                        value={roleInput}
                        onChange={(e) => setRoleInput(e.target.value)}
                        placeholder="Nome do papel"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddRole();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddRole} variant="secondary">
                        Adicionar
                      </Button>
                    </div>

                    {formData.availableRoles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.availableRoles.map((role) => (
                          <div
                            key={role}
                            className="flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium border border-slate-200"
                          >
                            {role}
                            <button
                              type="button"
                              onClick={() => handleRemoveRole(role)}
                              className="ml-1 text-slate-400 hover:text-red-500 font-bold"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.availableRoles.length > 0 && (
                      <label className="flex items-start gap-3 cursor-pointer group mt-4">
                        <input
                          type="checkbox"
                          name="requireRoles"
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                          checked={formData.requireRoles}
                          onChange={handleChange}
                        />
                        <div>
                          <span className="block text-sm font-medium text-slate-700 group-hover:text-slate-900">
                            Exigir escolha de papel
                          </span>
                          <span className="block text-sm text-slate-500">
                            Obrigatório selecionar pelo menos um papel para confirmar presença.
                          </span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t border-slate-50 pt-6">
              <Link to="/app">
                <Button variant="ghost" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Convoka'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
