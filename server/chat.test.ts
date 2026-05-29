import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("chat router", () => {
  it("should create a conversation", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.createConversation({
      title: "Test Conversation",
      description: "A test conversation",
    });

    expect(result).toBeDefined();
  });

  it("should get user conversations", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a conversation first
    await caller.chat.createConversation({
      title: "Test Conversation",
    });

    const conversations = await caller.chat.getConversations();
    expect(Array.isArray(conversations)).toBe(true);
  });

  it("should send a message and get response from LLM", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a conversation
    const convResult = await caller.chat.createConversation({
      title: "Test Chat",
    });

    // Get the conversation ID from the result
    const conversations = await caller.chat.getConversations();
    const conversation = conversations[0];

    if (conversation) {
      const result = await caller.chat.sendMessage({
        conversationId: conversation.id,
        message: "Olá, como você está?",
      });

      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe("string");
    }
  });
});

describe("tickets router", () => {
  it("should create a ticket", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tickets.create({
      title: "Test Ticket",
      description: "A test ticket",
      priority: "normal",
    });

    expect(result).toBeDefined();
  });

  it("should list tickets", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const tickets = await caller.tickets.list();
    expect(Array.isArray(tickets)).toBe(true);
  });

  it("should update ticket status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a ticket
    await caller.tickets.create({
      title: "Test Ticket",
      description: "A test ticket",
    });

    const tickets = await caller.tickets.list();
    const ticket = tickets[0];

    if (ticket) {
      const result = await caller.tickets.updateStatus({
        id: ticket.id,
        status: "in_progress",
      });

      expect(result).toBeDefined();
    }
  });
});

describe("appointments router", () => {
  it("should create an appointment", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const result = await caller.appointments.create({
      title: "Test Appointment",
      startTime,
      endTime,
      location: "Room 101",
    });

    expect(result).toBeDefined();
  });

  it("should list appointments", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const appointments = await caller.appointments.list();
    expect(Array.isArray(appointments)).toBe(true);
  });
});

describe("correspondence router", () => {
  it("should create correspondence", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.correspondence.create({
      type: "incoming",
      subject: "Test Mail",
      sender: "sender@example.com",
    });

    expect(result).toBeDefined();
  });

  it("should list correspondence", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const correspondence = await caller.correspondence.list();
    expect(Array.isArray(correspondence)).toBe(true);
  });
});

describe("notifications router", () => {
  it("should list user notifications", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const notifications = await caller.notifications.list();
    expect(Array.isArray(notifications)).toBe(true);
  });
});
