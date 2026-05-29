import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Bell, Trash2 } from "lucide-react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { data: notifications, refetch } = trpc.notifications.list.useQuery();
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();

  const handleMarkAsRead = async (id: number) => {
    await markAsReadMutation.mutateAsync({ id });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notificações</h1>
        <p className="text-muted-foreground mt-2">Você tem {notifications?.filter((n: any) => !n.isRead).length || 0} notificações não lidas</p>
      </div>

      <div className="grid gap-4">
        {notifications?.map((notif: any) => (
          <Card
            key={notif.id}
            className={`card-elegant p-6 ${!notif.isRead ? "border-accent border-2" : ""}`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                notif.type === "ticket" ? "bg-blue-100" :
                notif.type === "appointment" ? "bg-green-100" :
                notif.type === "correspondence" ? "bg-purple-100" :
                "bg-gray-100"
              }`}>
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{notif.title}</h3>
                <p className="text-muted-foreground text-sm mt-1">{notif.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(notif.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              {!notif.isRead && (
                <Button
                  onClick={() => handleMarkAsRead(notif.id)}
                  size="sm"
                  variant="outline"
                >
                  Marcar como lida
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
