import { NextRequest, NextResponse } from "next/server";

// Optional: ensure this route is handled at runtime (prevents static optimization)
export const dynamic = "force-dynamic";

function getVerifyToken(): string {
  return (
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
    process.env.WEBHOOK_VERIFY_TOKEN ||
    process.env.VERIFY_TOKEN ||
    ""
  );
}

export async function GET(request: NextRequest): Promise<Response> {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verifyToken = getVerifyToken();

  if (mode === "subscribe" && token && token === verifyToken) {
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
