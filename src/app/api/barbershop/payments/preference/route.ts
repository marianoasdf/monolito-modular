import { decrypt } from "../../../../../core/crypto/crypto-utils";
import { prisma } from "../../../../../core/shared/infra/prisma/prismaClient";
import { isMercadoPagoConfig } from "../../../../../modules/integrations/types";
import { resolvePublicTenantByHost } from "../../../../publicTenantHosts";

interface CreatePreferenceRequest {
  tenantId?: string;
  tenantSlug?: string;
  appointmentId?: string;
  title?: string;
  unitPrice?: number;
}

function readBody(value: unknown): CreatePreferenceRequest | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;

  return {
    tenantId: typeof record.tenantId === "string" ? record.tenantId.trim() : undefined,
    tenantSlug: typeof record.tenantSlug === "string" ? record.tenantSlug.trim() : undefined,
    appointmentId: typeof record.appointmentId === "string" ? record.appointmentId.trim() : undefined,
    title: typeof record.title === "string" ? record.title.trim() : undefined,
    unitPrice: typeof record.unitPrice === "number" ? record.unitPrice : undefined,
  };
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

  if (!body.unitPrice || body.unitPrice <= 0) {
    return Response.json({ message: "unitPrice must be greater than zero" }, { status: 400 });
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

  const origin = new URL(request.url).origin;
  const originHost = new URL(origin).hostname;
  const isLocalOrigin = ["localhost", "127.0.0.1"].includes(originHost) || originHost.startsWith("192.168.");
  const publicTenant = resolvePublicTenantByHost(new URL(request.url).host);
  const returnBasePath = publicTenant?.slug === body.tenantSlug
    ? "/payment"
    : body.tenantSlug
      ? `/${body.tenantSlug}/barbershop/payment`
      : "/barbershop/payment";
  const preferencePayload = {
    purpose: "wallet_purchase",
    items: [
      {
        id: body.appointmentId,
        title: body.title || "Turno barbería",
        quantity: 1,
        unit_price: body.unitPrice,
        currency_id: "ARS",
      },
    ],
    external_reference: body.appointmentId,
    ...(!isLocalOrigin
      ? {
          back_urls: {
            success: `${origin}${returnBasePath}/success?appointmentId=${encodeURIComponent(body.appointmentId)}`,
            failure: `${origin}${returnBasePath}/failure?appointmentId=${encodeURIComponent(body.appointmentId)}`,
            pending: `${origin}${returnBasePath}/pending?appointmentId=${encodeURIComponent(body.appointmentId)}`,
          },
          auto_return: "approved",
          notification_url: `${origin}/api/barbershop/payments/webhook`,
        }
      : {}),
  };

  const preferenceResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(preferencePayload),
  });

  const preferenceBody = (await preferenceResponse.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
  };

  if (!preferenceResponse.ok || !preferenceBody.id) {
    return Response.json(
      { message: preferenceBody.message || "No se pudo crear la preferencia de Mercado Pago" },
      { status: 400 },
    );
  }

  return Response.json({ preferenceId: preferenceBody.id });
}
