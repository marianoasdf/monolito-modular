import { decrypt } from "../../../../../core/crypto/crypto-utils";
import { prisma } from "../../../../../core/shared/infra/prisma/prismaClient";
import { isMercadoPagoConfig } from "../../../../../modules/integrations/types";

export const dynamic = "force-dynamic";

interface MercadoPagoWebhookBody {
  type?: string;
  action?: string;
  data?: {
    id?: string | number;
  };
}

interface MercadoPagoPaymentResponse {
  id?: number;
  status?: string;
  external_reference?: string;
}

function resolvePaymentId(request: Request, body: MercadoPagoWebhookBody): string | null {
  const url = new URL(request.url);
  const queryPaymentId = url.searchParams.get("data.id") || url.searchParams.get("id");
  const bodyPaymentId = body.data?.id;

  if (queryPaymentId) return queryPaymentId;
  if (typeof bodyPaymentId === "string") return bodyPaymentId;
  if (typeof bodyPaymentId === "number") return String(bodyPaymentId);
  return null;
}

function resolveAppointmentPaymentStatus(status?: string): "pending" | "paid" | "failed" {
  if (status === "approved") return "paid";
  if (["rejected", "cancelled", "refunded", "charged_back"].includes(status || "")) return "failed";
  return "pending";
}

async function fetchPaymentWithTenantToken(paymentId: string): Promise<{
  tenantId: string;
  payment: MercadoPagoPaymentResponse;
} | null> {
  const integrations = await prisma.tenantIntegration.findMany({
    where: { provider: "mercadopago" },
  });

  for (const integration of integrations) {
    if (!isMercadoPagoConfig(integration.config)) continue;

    const accessToken = decrypt(
      integration.config.accessToken.encrypted,
      integration.config.accessToken.iv,
      integration.config.accessToken.authTag,
    );

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) continue;

    const payment = (await response.json()) as MercadoPagoPaymentResponse;
    return { tenantId: integration.tenantId, payment };
  }

  return null;
}

export async function POST(request: Request): Promise<Response> {
  let body: MercadoPagoWebhookBody = {};

  try {
    body = (await request.json()) as MercadoPagoWebhookBody;
  } catch {
    body = {};
  }

  const paymentId = resolvePaymentId(request, body);

  if (!paymentId) {
    return Response.json({ received: true, message: "No payment id received" });
  }

  const resolvedPayment = await fetchPaymentWithTenantToken(paymentId);

  if (!resolvedPayment?.payment.external_reference) {
    return Response.json({ received: true, message: "Payment not found" });
  }

  const paymentStatus = resolveAppointmentPaymentStatus(resolvedPayment.payment.status);

  await prisma.barbershopAppointment.updateMany({
    where: {
      id: resolvedPayment.payment.external_reference,
      tenantId: resolvedPayment.tenantId,
      paymentMethod: "mercadopago",
    },
    data: { paymentStatus },
  });

  return Response.json({ received: true });
}
