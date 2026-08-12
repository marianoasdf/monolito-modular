import { prisma } from "../../../../../core/shared/infra/prisma/prismaClient";
import { isMercadoPagoConfig } from "../../../../../modules/integrations/types";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const tenantId = url.searchParams.get("tenantId")?.trim();

  if (!tenantId) {
    return Response.json({ message: "tenantId is required" }, { status: 400 });
  }

  const integration = await prisma.tenantIntegration.findUnique({
    where: {
      tenantId_provider: {
        tenantId,
        provider: "mercadopago",
      },
    },
  });

  if (!integration || !isMercadoPagoConfig(integration.config)) {
    return Response.json({ message: "Mercado Pago is not configured for this tenant" }, { status: 404 });
  }

  return Response.json({ publicKey: integration.config.publicKey });
}
