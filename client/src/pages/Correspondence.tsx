import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Mail, Plus } from "lucide-react";

export default function Correspondence() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "incoming",
    subject: "",
    sender: "",
    recipient: "",
    description: "",
    priority: "normal",
  });

  const { data: correspondence, refetch } = trpc.correspondence.list.useQuery();
  const createMutation = trpc.correspondence.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData as any);
    setFormData({ type: "incoming", subject: "", sender: "", recipient: "", description: "", priority: "normal" });
    setShowForm(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Correspondência</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Registrar Correspondência
        </Button>
      </div>

      {showForm && (
        <Card className="card-elegant p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-elegant"
            >
              <option value="incoming">Entrada</option>
              <option value="outgoing">Saída</option>
              <option value="internal">Interna</option>
              <option value="confidential">Confidencial</option>
              <option value="urgent">Urgente</option>
            </select>
            <Input
              placeholder="Assunto"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="input-elegant"
              required
            />
            <Input
              placeholder="Remetente"
              value={formData.sender}
              onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
              className="input-elegant"
            />
            <Input
              placeholder="Destinatário"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              className="input-elegant"
            />
            <textarea
              placeholder="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-elegant w-full"
              rows={3}
            />
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
            <div className="flex gap-2">
              <Button type="submit">Registrar</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {correspondence?.map((corr: any) => (
          <Card key={corr.id} className="card-elegant p-6">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{corr.subject}</h3>
                <p className="text-muted-foreground text-sm mt-1">#{corr.referenceNumber}</p>
                {corr.sender && <p className="text-muted-foreground text-sm">De: {corr.sender}</p>}
                {corr.recipient && <p className="text-muted-foreground text-sm">Para: {corr.recipient}</p>}
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`text-xs font-semibold px-3 py-1 rounded ${
                  corr.type === "urgent" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {corr.type}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded bg-green-100 text-green-700">
                  {corr.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
