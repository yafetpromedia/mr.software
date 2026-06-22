import { NextResponse } from "next/server";
import { runCopilotTurn } from "@/lib/ai/copilot";
import { copilotRequestSchema } from "@/lib/ai/copilot-schema";
import { isAiConfigured } from "@/lib/ai/config";
import {
  appendCopilotExchange,
  getCopilotConversation,
  getLatestCopilotConversation,
  listCopilotConversations,
} from "@/lib/ai/conversations";
import { getSession } from "@/lib/auth/session";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

function serializeConversation(conversation: {
  id: string;
  messages: { id: string; role: string; content: string; createdAt: Date }[];
}) {
  return {
    id: conversation.id,
    messages: conversation.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
  };
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to use Copilot" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  if (conversationId) {
    const conversation = await getCopilotConversation(session.id, conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    return NextResponse.json({
      conversation: serializeConversation(conversation),
      aiEnabled: isAiConfigured(),
    });
  }

  const [conversation, history] = await Promise.all([
    getLatestCopilotConversation(session.id),
    listCopilotConversations(session.id),
  ]);

  return NextResponse.json({
    conversation: conversation ? serializeConversation(conversation) : null,
    history: history.map((h) => ({
      id: h.id,
      title: h.title,
      updatedAt: h.updatedAt.toISOString(),
      messageCount: h._count.messages,
      preview: h.messages[0]?.content?.slice(0, 80) ?? "",
    })),
    aiEnabled: isAiConfigured(),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to use Copilot" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const rl = checkRateLimit(`ai-copilot:${session.id}:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many messages. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = copilotRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { message, conversationId } = parsed.data;

  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "Mr.Software AI is not configured. Add AI_API_KEY to your .env file." },
      { status: 503 },
    );
  }

  try {
    let history: { role: "user" | "assistant"; content: string }[] = [];
    if (conversationId) {
      const existing = await getCopilotConversation(session.id, conversationId);
      if (existing) {
        history = existing.messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      }
    }

    const reply = await runCopilotTurn(history, message, session.id);

    const savedId = await appendCopilotExchange(
      session.id,
      message,
      reply,
      conversationId,
    );

    return NextResponse.json({
      reply,
      conversationId: savedId,
      aiEnabled: isAiConfigured(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Copilot failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
