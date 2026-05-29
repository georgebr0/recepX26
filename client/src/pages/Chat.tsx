import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { MessageCircle, Send, Plus, Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";

export default function Chat() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, refetch: refetchConversations } = trpc.chat.getConversations.useQuery();
  const { data: messages } = trpc.chat.getMessages.useQuery(
    { conversationId: selectedConversation || 0 },
    { enabled: !!selectedConversation }
  );

  const createConversationMutation = trpc.chat.createConversation.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCreateConversation = async () => {
    const title = prompt("Título da conversa:");
    if (title) {
      await createConversationMutation.mutateAsync({ title });
      refetchConversations();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    setIsLoading(true);
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        message: message.trim(),
      });
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-6">
      {/* Sidebar */}
      <div className="w-80 card-elegant p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
          <Button
            onClick={handleCreateConversation}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations?.map((conv: any) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`w-full text-left p-3 rounded-lg transition-elegant ${
                selectedConversation === conv.id
                  ? "bg-accent text-white"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <p className="font-medium truncate">{conv.title}</p>
              <p className="text-xs opacity-70 truncate">{conv.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 card-elegant p-6 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages?.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.role === "user"
                        ? "bg-accent text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Streamdown>{msg.content}</Streamdown>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="input-elegant"
              />
              <Button
                type="submit"
                disabled={isLoading || !message.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Nenhuma conversa selecionada</h3>
            <p className="text-muted-foreground mt-2">Crie uma nova conversa ou selecione uma existente</p>
            <Button onClick={handleCreateConversation} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Nova Conversa
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
