import { AiProduct } from "@prisma/client";
import { NextResponse } from "next/server";
import { listUserConversations } from "@/lib/ai/conversations";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productParam = searchParams.get("product");
  const product =
    productParam && productParam in AiProduct
      ? AiProduct[productParam as keyof typeof AiProduct]
      : undefined;

  const conversations = await listUserConversations(session.id, product);
  return NextResponse.json({
    conversations: conversations.map((c) => ({
      id: c.id,
      title: c.title,
      product: c.product,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      lastMessage: c.messages[0] ?? null,
    })),
  });
}
