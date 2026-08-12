import crypto from "crypto";
import { decrypt } from "../../../../core/crypto/crypto-utils";
import { prisma } from "../../../../core/shared/infra/prisma/prismaClient";
import { isMercadoPagoConfig } from "../../../../modules/integrations/types";

interface CreatePaymentRequest {
  tenantId?: string;
  appointmentId?: string;
  token?: string;
  transaction_amount?: number;
  payment_method_id?: string;
  issuer_id?: string;
  installments?: number;
  payer?: unknown;
}

function readBody(value: unknown): CreatePaymentRequest | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;

  return {
    tenantId: typeof record.tenantId === "string" ? record.tenantId.trim() : undefined,
    appointmentId: typeof record.appointmentId === "string" ? record.appointmentId.trim() : undefined,
    token: typeof record.token === "string" ? record.token : undefined,
    transaction_amount: typeof record.transaction_amount === "number" ? record.transaction_amount : undefined,
    payment_method_id: typeof record.payment_method_id === "string" ? record.payment_method_id : undefined,
    issuer_id: typeof record.issuer_id === "string" ? record.issuer_id : undefined,
    installments: typeof record.installments === "number" ? record.installments : undefined,
    payer: record.payer,
  };
}

function resolveAppointmentPaymentStatus(status?: string): "pending" | "paid" | "failed" {
  if (status === "approved") return "paid";
  if (["rejected", "cancelled", "refunded", "charged_back"].includes(status || "")) return "failed";
  return "pending";
}

export async function POST(request: Request): Promise<Response> {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ message: "Request body must be valid JSON" }, { status: 400 });
  }

  const body = readBody(rawBody);

  if (!body?.tenantId || !body.appointmentId) {
    return Response.json({ message: "tenantId and appointmentId are required" }, { status: 400 });
  }

  const appointment = await prisma.barbershopAppointment.findFirst({
    where: {
      id: body.appointmentId,
      tenantId: body.tenantId,
      paymentMethod: "mercadopago",
    },
    select: { id: true },
  });

  if (!appointment) {
    return Response.json({ message: "Appointment was not found" }, { status: 404 });
  }

  const integration = await prisma.tenantIntegration.findUnique({
    where: {
      tenantId_provider: {
        tenantId: body.tenantId,
        provider: "mercadopago",
      },
    },
  });

  if (!integration || !isMercadoPagoConfig(integration.config)) {
    return Response.json({ message: "Mercado Pago is not configured for this tenant" }, { status: 404 });
  }

  const accessToken = decrypt(
    integration.config.accessToken.encrypted,
    integration.config.accessToken.iv,
    integration.config.accessToken.authTag,
  );

  const paymentResponse = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      token: body.token,
      transaction_amount: body.transaction_amount,
      payment_method_id: body.payment_method_id,
      issuer_id: body.issuer_id,
      installments: body.installments,
      payer: body.payer,
      external_reference: body.appointmentId,
    }),
  });

  const paymentBody = (await paymentResponse.json().catch(() => ({}))) as {
    id?: number;
    status?: string;
    message?: string;
  };

  if (!paymentResponse.ok || !paymentBody.status) {
    return Response.json(
      { message: paymentBody.message || "No se pudo procesar el pago de Mercado Pago" },
      { status: 400 },
    );
  }

  const paymentStatus = resolveAppointmentPaymentStatus(paymentBody.status);

  await prisma.barbershopAppointment.updateMany({
    where: {
      id: body.appointmentId,
      tenantId: body.tenantId,
      paymentMethod: "mercadopago",
    },
    data: { paymentStatus },
  });

  return Response.json({ paymentId: paymentBody.id, status: paymentBody.status, paymentStatus });
}
