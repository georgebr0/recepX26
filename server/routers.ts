import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import {
  createChatConversation,
  getChatConversations,
  getChatMessages,
  addChatMessage,
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  createAppointment,
  getAppointments,
  getAppointmentById,
  createCorrespondence,
  getCorrespondence,
  getCorrespondenceById,
  createNotification,
  getNotifications,
  markNotificationAsRead,
} from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Chat Router
  chat: router({
    createConversation: protectedProcedure
      .input(z.object({ title: z.string(), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        return createChatConversation(ctx.user.id, input.title, input.description);
      }),
    getConversations: protectedProcedure.query(async ({ ctx }) => {
      return getChatConversations(ctx.user.id);
    }),
    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return getChatMessages(input.conversationId);
      }),
    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Save user message
        await addChatMessage(input.conversationId, "user", input.message);

        // Get conversation history
        const messages = await getChatMessages(input.conversationId);
        const conversationHistory = messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));

        // Invoke LLM with Recep system prompt
        const systemPrompt = `Você é **Recep**, um agente de receção virtual inteligente e profissional.
Você representa a empresa com excelência, sendo o primeiro ponto de contacto para visitantes, clientes, fornecedores e colaboradores internos.
Seu comportamento deve refletir: cordialidade e simpatia genuínas, comunicação clara e objetiva, dinamismo e proatividade.
Responda sempre em português, de forma formal mas acessível.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        const assistantMessage = typeof messageContent === "string" 
          ? messageContent 
          : "Desculpe, não consegui processar sua mensagem.";

        // Save assistant response
        await addChatMessage(input.conversationId, "assistant", assistantMessage);

        return { message: assistantMessage };
      }),
  }),

  // Tickets Router
  tickets: router({
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
          category: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createTicket(
          input.title,
          input.description,
          ctx.user.id,
          input.priority || "normal",
          input.category
        );
      }),
    list: protectedProcedure.query(async () => {
      return getTickets();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getTicketById(input.id);
      }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["open", "in_progress", "pending", "resolved", "closed"]),
        })
      )
      .mutation(async ({ input }) => {
        return updateTicketStatus(input.id, input.status);
      }),
  }),

  // Appointments Router
  appointments: router({
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          startTime: z.date(),
          endTime: z.date(),
          location: z.string().optional(),
          meetingLink: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createAppointment(
          input.title,
          input.startTime,
          input.endTime,
          ctx.user.id,
          input.location,
          input.meetingLink,
          input.description
        );
      }),
    list: protectedProcedure.query(async () => {
      return getAppointments();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getAppointmentById(input.id);
      }),
  }),

  // Correspondence Router
  correspondence: router({
    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["incoming", "outgoing", "internal", "confidential", "urgent"]),
          subject: z.string(),
          sender: z.string().optional(),
          recipient: z.string().optional(),
          description: z.string().optional(),
          priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createCorrespondence(
          input.type,
          input.subject,
          ctx.user.id,
          input.sender,
          input.recipient,
          input.description,
          input.priority || "normal"
        );
      }),
    list: protectedProcedure.query(async () => {
      return getCorrespondence();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getCorrespondenceById(input.id);
      }),
  }),

  // Notifications Router
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getNotifications(ctx.user.id);
    }),
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return markNotificationAsRead(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
