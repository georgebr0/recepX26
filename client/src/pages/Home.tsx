import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { MessageCircle, Ticket, Calendar, Mail, BarChart3, Bell, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm border-b border-border/40">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Recep</span>
          </div>
          <Button onClick={() => window.location.href = getLoginUrl()} size="lg">
            Entrar
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight">
                Gestão de Atendimento e Recepção
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary"> Inteligente</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Plataforma completa para gerenciar atendimento ao cliente, tickets, agendamentos e correspondência com IA integrada.
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = getLoginUrl()} 
              size="lg" 
              className="w-full sm:w-auto h-12 text-base"
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: MessageCircle, title: "Chat com IA", desc: "Atendimento automatizado 24/7" },
              { icon: Ticket, title: "Gestão de Tickets", desc: "Rastreamento completo" },
              { icon: Calendar, title: "Agendamentos", desc: "Calendário interativo" },
              { icon: Mail, title: "Correspondência", desc: "Registro e rastreamento" },
            ].map((feature, idx) => (
              <div key={idx} className="card-elegant p-6">
                <feature.icon className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border/40">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Funcionalidades Principais</h2>
            <p className="text-lg text-muted-foreground">Tudo que você precisa para gerenciar sua recepção com elegância</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "Chat Inteligente",
                description: "Agente Recep com IA para atendimento profissional e responsivo",
              },
              {
                icon: Ticket,
                title: "Sistema de Tickets",
                description: "Criação, atribuição e acompanhamento de tickets com histórico completo",
              },
              {
                icon: Calendar,
                title: "Calendário de Eventos",
                description: "Agendamentos interativos com notificações e lembretes automáticos",
              },
              {
                icon: Mail,
                title: "Gestão de Correspondência",
                description: "Registro de entrada/saída com rastreamento e notificações",
              },
              {
                icon: BarChart3,
                title: "Dashboard Executivo",
                description: "Visão geral de métricas, tickets pendentes e próximos eventos",
              },
              {
                icon: Bell,
                title: "Notificações em Tempo Real",
                description: "Alertas instantâneos para eventos importantes e atualizações",
              },
            ].map((feature, idx) => (
              <div key={idx} className="card-elegant p-8 transition-elegant hover:shadow-md">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/40">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">Pronto para começar?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Junte-se a centenas de empresas que já utilizam Recep para gerenciar seu atendimento com excelência.
          </p>
          <Button 
            onClick={() => window.location.href = getLoginUrl()} 
            size="lg" 
            className="h-12 text-base"
          >
            Acessar Plataforma
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2026 Recep - Plataforma de Recepção Virtual. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
