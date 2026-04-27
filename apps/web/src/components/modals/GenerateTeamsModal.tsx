import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';

interface GenerateTeamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: { numberOfTeams: number; roleRequirements: Record<string, number> }) => void;
  availableRoles: string[];
  totalParticipants: number;
  loading?: boolean;
}

export function GenerateTeamsModal({
  isOpen,
  onClose,
  onGenerate,
  availableRoles,
  totalParticipants,
  loading,
}: GenerateTeamsModalProps) {
  const [numberOfTeams, setNumberOfTeams] = useState(2);
  const [roleReqs, setRoleReqs] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const handleRoleChange = (role: string, value: string) => {
    const num = parseInt(value) || 0;
    setRoleReqs((prev) => ({
      ...prev,
      [role]: num,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      numberOfTeams,
      roleRequirements: Object.fromEntries(Object.entries(roleReqs).filter(([_, v]) => v > 0)),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardHeader>
            <CardTitle>Gerar Times Balanceados</CardTitle>
            <p className="text-sm text-slate-500">
              O algoritmo irá agrupar os {totalParticipants} participantes garantindo as cotas de
              papéis primeiro, e depois nivelando o skill total de cada time.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de Times</label>
                <Input
                  type="number"
                  min="2"
                  value={numberOfTeams}
                  onChange={(e) => setNumberOfTeams(parseInt(e.target.value))}
                  required
                />
              </div>

              {availableRoles.length > 0 && (
                <div className="space-y-3 pt-2">
                  <label className="text-sm font-medium block border-b pb-1">
                    Cotas Obrigatórias por Time (Opcional)
                  </label>
                  {availableRoles.map((role) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{role}</span>
                      <Input
                        type="number"
                        min="0"
                        className="w-20"
                        value={roleReqs[role] || ''}
                        onChange={(e) => handleRoleChange(role, e.target.value)}
                        placeholder="Qtd"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Gerando...' : 'Gerar Times'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
