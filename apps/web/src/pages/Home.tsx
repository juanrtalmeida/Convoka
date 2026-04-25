import { Calendar, CreditCard, Users, Zap } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans selection:bg-primary/20">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Zap size={20} className="fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Convoka</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
            >
              Entrar
            </Link>
            <Link to="/register">
              <Button size="sm">Começar grátis</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(108,59,255,0.15),rgba(255,255,255,0))]"></div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
                Organize seus encontros <br className="hidden sm:block" />
                sem <span className="text-gradient">dor de cabeça</span>
              </h1>
              <p className="mt-8 text-lg leading-8 text-slate-600 sm:text-xl">
                Do futebol de quarta à reunião do condomínio. Crie eventos, gerencie listas de
                espera automáticas e cobre pagamentos via Pix antes que alguém dê o cano.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/register">
                  <button className="gradient-primary text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-primary/50 transition-all hover:-translate-y-0.5 active:translate-y-0 text-lg">
                    Criar meu primeiro Convoka
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 sm:py-32 bg-white border-y border-slate-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary">
                Tudo em um só lugar
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Foco no encontro, não na gestão
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-slate-900">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    Lista de Espera Inteligente
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">
                      Defina o limite de vagas. Se alguém sair, o próximo da fila é promovido
                      automaticamente. Fim das planilhas manuais.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-slate-900">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <CreditCard className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    Pagamentos Integrados
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">
                      Exija o pagamento antes de confirmar a vaga. Aceite Pix ou cartão e diga adeus
                      aos caloteiros do grupo.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-slate-900">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    Sem atrito para entrar
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">
                      Envie apenas um link. Seus convidados entram no evento com 2 cliques, mesmo se
                      não tiverem conta no Convoka.
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF / CTA */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl bg-slate-900 rounded-3xl p-12 text-center shadow-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Pronto para facilitar sua vida?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Junte-se a milhares de organizadores que deixaram o caos do WhatsApp para trás.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-white text-slate-900 hover:bg-slate-100 shadow-none"
                  >
                    Criar conta gratuitamente
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-900">
            <Zap size={20} className="text-primary fill-primary" />
            <span className="text-xl font-bold tracking-tight">Convoka</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Convoka. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900">
              Termos
            </a>
            <a href="#" className="hover:text-slate-900">
              Privacidade
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
