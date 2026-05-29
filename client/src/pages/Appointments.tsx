import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Calendar, Plus } from "lucide-react";

export default function Appointments() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    location: "",
    meetingLink: "",
    description: "",
  });

  const { data: appointments, refetch } = trpc.appointments.list.useQuery();
  const createMutation = trpc.appointments.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      ...formData,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
    });
    setFormData({ title: "", startTime: "", endTime: "", location: "", meetingLink: "", description: "" });
    setShowForm(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
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
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="input-elegant"
                required
              />
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="input-elegant"
                required
              />
            </div>
            <Input
              placeholder="Local"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-elegant"
            />
            <Input
              placeholder="Link da Reunião"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              className="input-elegant"
            />
            <textarea
              placeholder="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-elegant w-full"
              rows={3}
            />
            <div className="flex gap-2">
              <Button type="submit">Criar Agendamento</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {appointments?.map((apt: any) => (
          <Card key={apt.id} className="card-elegant p-6">
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{apt.title}</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {new Date(apt.startTime).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(apt.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
                {apt.location && <p className="text-muted-foreground text-sm">📍 {apt.location}</p>}
                {apt.meetingLink && (
                  <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer" className="text-accent text-sm hover:underline">
                    Acessar Reunião
                  </a>
                )}
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded bg-green-100 text-green-700">
                {apt.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
