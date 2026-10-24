import { PrismaClient } from "@prisma/client";
import { encrypt } from "../src/core/crypto/crypto-utils";
import { isWhatsAppConfig, type WhatsAppConfig } from "../src/modules/integrations/types";

const prisma = new PrismaClient();

async function updateWhatsAppToken(): Promise<void> {
  const tenantSlug = process.argv[2]?.trim() || "mgbarber";
  const apiToken = process.env.WHATSAPP_API_TOKEN?.trim();

  if (!apiToken) {
    throw new Error(
      "Falta WHATSAPP_API_TOKEN. Agregalo al .env o pasalo inline:\n" +
        '  WHATSAPP_API_TOKEN="..." npx tsx scripts/update-whatsapp-token.ts',
    );
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });

  if (!tenant) {
    throw new Error(`Tenant '${tenantSlug}' no encontrado en la base de datos`);
  }

  const integration = await prisma.tenantIntegration.findUnique({
    where: {
      tenantId_provider: {
        tenantId: tenant.id,
        provider: "whatsapp",
      },
    },
  });

  const existingConfig: unknown = integration?.config;
  if (!integration || !isWhatsAppConfig(existingConfig)) {
    throw new Error(
      `No hay integración WhatsApp válida para '${tenantSlug}'. ` +
        "Corré primero scripts/migrate-to-tenant-integrations.ts",
    );
  }

  const config: WhatsAppConfig = existingConfig;

  await prisma.tenantIntegration.update({
    where: {
      tenantId_provider: {
        tenantId: tenant.id,
        provider: "whatsapp",
      },
    },
    data: {
      config: {
        phoneNumberId: config.phoneNumberId,
        apiToken: encrypt(apiToken),
        ...(config.recipientPhone ? { recipientPhone: config.recipientPhone } : {}),
        ...(config.recipientPhones?.length ? { recipientPhones: config.recipientPhones } : {}),
      },
    },
  });

  console.log(`Token WhatsApp actualizado para tenant '${tenantSlug}'`);
  console.log(`  phoneNumberId: ${config.phoneNumberId}`);
  console.log(`  recipientPhone: ${config.recipientPhone}`);
}

updateWhatsAppToken()
  .catch((error: unknown) => {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
