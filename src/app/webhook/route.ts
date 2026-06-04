import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../core/shared/infra/prisma/prismaClient";

// Optional: ensure this route is handled at runtime (prevents static optimization)
export const dynamic = "force-dynamic";

async function isValidVerifyToken(token: string): Promise<boolean> {
  // Buscar todas las integraciones de WhatsApp y validar el token contra cada una
  const integrations = await prisma.tenantIntegration.findMany({
    where: { provider: "whatsapp" },
  });

  for (const integration of integrations) {
    if (typeof integration.config !== "object" || integration.config === null) {
      continue;
    }

    const config = integration.config as Record<string, unknown>;
    const webhookVerifyToken = typeof config.webhookVerifyToken === "string" ? config.webhookVerifyToken : null;

    if (webhookVerifyToken && token === webhookVerifyToken) {
      return true;
    }
  }

  return false;
}

export async function GET(request: NextRequest): Promise<Response> {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && await isValidVerifyToken(token)) {
    // Echo the challenge so Meta can verify the webhook URL
    return new NextResponse(String(challenge ?? ""), { status: 200 });
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = (await request.json()) as unknown;

    if (
      body &&
      typeof body === "object" &&
      (body as { object?: string }).object === "whatsapp_business_account"
    ) {
      const entries = Array.isArray((body as { entry?: unknown[] }).entry)
        ? ((body as { entry?: unknown[] }).entry as Array<{
            changes?: Array<{
              value?: {
                messages?: Array<{
                  id?: string;
                  from?: string;
                  type?: string;
                  text?: { body?: string };
                  timestamp?: string;
                }>;
              };
            }>;
          }>)
        : [];

      for (const entry of entries) {
        const changes = Array.isArray(entry?.changes) ? entry.changes : [];
        for (const change of changes) {
          const value = change?.value || {};
          const messages = Array.isArray((value as { messages?: unknown[] }).messages)
            ? ((value as { messages?: unknown[] }).messages as Array<{
                id?: string;
                from?: string;
                type?: string;
                text?: { body?: string };
                timestamp?: string;
              }>)
            : [];

          for (const msg of messages) {
            console.log(
              "Incoming WhatsApp message:",
              JSON.stringify(
                {
                  from: msg.from,
                  type: msg.type,
                  text: msg.text?.body,
                  timestamp: msg.timestamp,
                  id: msg.id,
                },
                null,
                2,
              ),
            );
          }
        }
      }

      // Acknowledge receipt to prevent retries
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    return new NextResponse("Not Found", { status: 404 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
