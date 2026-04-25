import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export function DesignSystem() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 md:p-12 lg:p-24 font-sans">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <Link to="/" className="text-primary hover:underline text-sm font-medium">
            &larr; Voltar para Home
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Estilo visual do Convoka inspirado no Stripe: muito espaço em branco, bordas
            arredondadas, sombras suaves e roxo como cor predominante.
          </p>
        </div>

        <hr className="border-slate-200" />

        {/* Cores */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Cores Principais</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 rounded-2xl bg-primary shadow-sm flex items-end p-4">
                <span className="text-white font-medium">Primária</span>
              </div>
              <div className="text-sm text-slate-500">#6C3BFF (Roxo)</div>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-2xl gradient-primary shadow-sm flex items-end p-4">
                <span className="text-white font-medium">Gradiente</span>
              </div>
              <div className="text-sm text-slate-500">Primária &rarr; Azul</div>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-2xl bg-slate-900 flex items-end p-4 shadow-sm">
                <span className="text-white font-medium">Dark Bg</span>
              </div>
              <div className="text-sm text-slate-500">#0F172A</div>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-2xl bg-white border border-slate-200 flex items-end p-4 shadow-sm">
                <span className="text-slate-900 font-medium">Card Bg</span>
              </div>
              <div className="text-sm text-slate-500">#FFFFFF</div>
            </div>
          </div>
        </section>

        {/* Botões */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Botões</h2>
          <div className="flex flex-wrap gap-4 items-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Button variant="primary">Criar Convoka</Button>
            <Button variant="secondary">Cancelar</Button>
            <Button variant="outline">Ver detalhes</Button>
            <Button variant="ghost">Compartilhar</Button>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Inputs & Forms</h2>
          <div className="max-w-md p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Evento</label>
              <Input placeholder="Ex: Futebol de Quinta" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Local</label>
              <Input placeholder="Onde vai ser?" />
            </div>
            <Button className="w-full mt-4">Continuar</Button>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Cards</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-md shadow-slate-200/40 hover:shadow-lg hover:shadow-slate-200/50 transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Futebol de Quinta</CardTitle>
                <CardDescription>Hoje, 20:00 • Arena Society</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-500">
                  <p>12 confirmados • 2 vagas restantes</p>
                  <div className="mt-4 flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600 shadow-sm"
                      >
                        P{i}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Entrar na Lista
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-primary text-white border-none shadow-md shadow-primary/20">
              <CardHeader>
                <CardTitle className="text-white">Criar novo Convoka</CardTitle>
                <CardDescription className="text-white/80">
                  Organize seu próximo evento em 2 minutos.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-8">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <span className="text-3xl">+</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
