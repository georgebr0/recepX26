import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Ticket, Plus, Filter } from "lucide-react";

export default function Tickets() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", priority: "normal", category: "" });

  const { data: tickets, refetch } = trpc.tickets.list.useQuery();
  const createMutation = trpc.tickets.create.useMutation();
  const updateStatusMutation = trpc.tickets.updateStatus.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      title: formData.title,
      description: formData.description,
      priority: formData.priority as "low" | "normal" | "high" | "urgent",
      category: formData.category || undefined,
    });
    setFormData({ title: "", description: "", priority: "normal", category: "" });
    setShowForm(false);
    refetch();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await updateStatusMutation.mutateAsync({ id, status: status as "open" | "in_progress" | "pending" | "resolved" | "closed" });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Tickets</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      {showForm && (
        <Card className="card-elegant p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-elegant"
              required
            />
            <textarea
              placeholder="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-elegant w-full"
              rows={4}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input-elegant"
              >
                <option value="low">Baixa</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
              <Input
                placeholder="Categoria"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-elegant"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Criar Ticket</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {tickets?.map((ticket: any) => (
          <Card key={ticket.id} className="card-elegant p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">{ticket.title}</h3>
                </div>
                <p className="text-muted-foreground mb-2">{ticket.description}</p>
                <div className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">#{ticket.ticketNumber}</span>
                  {ticket.category && <span className="text-muted-foreground">• {ticket.category}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                  className={`text-xs font-semibold px-3 py-1 rounded ${
                    ticket.status === "open"
                      ? "bg-blue-100 text-blue-700"
                      : ticket.status === "in_progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  <option value="open">Aberto</option>
                  <option value="in_progress">Em Progresso</option>
                  <option value="resolved">Resolvido</option>
                  <option value="closed">Fechado</option>
                </select>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  ticket.priority === "urgent"
                    ? "bg-red-100 text-red-700"
                    : ticket.priority === "high"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
