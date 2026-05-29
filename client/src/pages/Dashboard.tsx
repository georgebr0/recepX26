import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { MessageCircle, Ticket, Calendar, Mail, TrendingUp, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: tickets } = trpc.tickets.list.useQuery();
  const { data: appointments } = trpc.appointments.list.useQuery();
  const { data: correspondence } = trpc.correspondence.list.useQuery();
  const { data: notifications } = trpc.notifications.list.useQuery();

  const stats = [
    {
      label: "Tickets Abertos",
      value: tickets?.filter((t: any) => t.status === "open").length || 0,
      icon: Ticket,
      color: "text-blue-500",
    },
    {
      label: "Agendamentos",
      value: appointments?.length || 0,
      icon: Calendar,
      color: "text-green-500",
    },
    {
      label: "Correspondência",
      value: correspondence?.length || 0,
      icon: Mail,
      color: "text-purple-500",
    },
    {
      label: "Notificações",
      value: notifications?.filter((n: any) => !n.isRead).length || 0,
      icon: AlertCircle,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bem-vindo, {user?.name}!</h1>
        <p className="text-muted-foreground mt-2">Aqui está um resumo do seu dia</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="card-elegant p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <Card className="card-elegant p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Tickets Recentes</h2>
          <div className="space-y-3">
            {tickets?.slice(0, 5).map((ticket: any) => (
              <div key={ticket.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{ticket.title}</p>
                  <p className="text-sm text-muted-foreground">#{ticket.ticketNumber}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                  ticket.status === "open" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                }`}>
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="card-elegant p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Próximos Agendamentos</h2>
          <div className="space-y-3">
            {appointments?.slice(0, 5).map((apt: any) => (
              <div key={apt.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{apt.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(apt.startTime).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-elegant p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: MessageCircle, label: "Chat", href: "/chat" },
            { icon: Ticket, label: "Novo Ticket", href: "/tickets" },
            { icon: Calendar, label: "Agendar", href: "/appointments" },
            { icon: Mail, label: "Correspondência", href: "/correspondence" },
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <a
                key={idx}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-muted transition-elegant"
              >
                <Icon className="w-6 h-6 text-accent" />
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </a>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
