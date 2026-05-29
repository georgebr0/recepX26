import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import {
  chatConversations,
  chatMessages,
  tickets,
  appointments,
  correspondence,
  notifications,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Chat Queries
export async function createChatConversation(
  userId: number,
  title: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .insert(chatConversations)
    .values({ userId, title, description, status: "active" });
  return result;
}

export async function getChatConversations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.userId, userId));
}

export async function getChatMessages(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(chatMessages.createdAt);
}

export async function addChatMessage(
  conversationId: number,
  role: "user" | "assistant" | "system",
  content: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(chatMessages).values({ conversationId, role, content });
}

// Ticket Queries
export async function createTicket(
  title: string,
  description: string,
  createdBy: number,
  priority: string = "normal",
  category?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ticketNumber = `TKT-${Date.now()}`;
  return db.insert(tickets).values({
    ticketNumber,
    title,
    description,
    createdBy,
    priority: priority as any,
    category,
    status: "open",
  });
}

export async function getTickets(filters?: {
  status?: string;
  assignedTo?: number;
  createdBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(tickets);
  // Basic filtering would go here
  return query;
}

export async function getTicketById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tickets).where(eq(tickets.id, id));
  return result[0];
}

export async function updateTicketStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(tickets).set({ status: status as any }).where(eq(tickets.id, id));
}

// Appointment Queries
export async function createAppointment(
  title: string,
  startTime: Date,
  endTime: Date,
  organizer: number,
  location?: string,
  meetingLink?: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(appointments).values({
    title,
    startTime,
    endTime,
    organizer,
    location,
    meetingLink,
    description,
    status: "scheduled",
  });
}

export async function getAppointments(organizer?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(appointments);
  return query;
}

export async function getAppointmentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(appointments).where(eq(appointments.id, id));
  return result[0];
}

// Correspondence Queries
export async function createCorrespondence(
  type: string,
  subject: string,
  registeredBy: number,
  sender?: string,
  recipient?: string,
  description?: string,
  priority: string = "normal"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const referenceNumber = `CORR-${Date.now()}`;
  return db.insert(correspondence).values({
    referenceNumber,
    type: type as any,
    subject,
    description,
    sender,
    recipient,
    registeredBy,
    priority: priority as any,
    status: "received",
  });
}

export async function getCorrespondence(filters?: { status?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(correspondence);
}

export async function getCorrespondenceById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(correspondence).where(eq(correspondence.id, id));
  return result[0];
}

// Notification Queries
export async function createNotification(
  userId: number,
  title: string,
  content: string,
  type: string,
  relatedId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(notifications).values({
    userId,
    title,
    content,
    type: type as any,
    relatedId,
    isRead: false,
  });
}

export async function getNotifications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(notifications.createdAt);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, id));
}


