import { Prisma, PrismaClient } from "@prisma/client";
import { encrypt } from "../src/core/crypto/crypto-utils";

const prisma = new PrismaClient();

const TENANT_SLUG = "lafamilia";
const DEFAULT_RECIPIENT_PHONE = "+5493455086144";

/**
 * Carga o reemplaza la integración de WhatsApp de La Familia.
 * No toca otros tenants ni la clave de admin.
 *
 * LAFAMILIA_WHATSAPP_PHONE_NUMBER_ID=... \
 * LAFAMILIA_WHATSAPP_API_TOKEN=... \
 * npx tsx scripts/provision-lafamilia-whatsapp.ts
 *
 * LAFAMILIA_WHATSAPP_RECIPIENT_PHONES es opcional. Si no viene, avisa a +5493455086144.
 * Varios teléfonos van separados por coma.
 */
async function provisionLaFamiliaWhatsApp(): Promise<void> {
  const phoneNumberId = process.env.LAFAMILIA_WHATSAPP_PHONE_NUMBER_ID?.trim() ?? "";
  const apiToken = process.env.LAFAMILIA_WHATSAPP_API_TOKEN?.trim() ?? "";
  const recipientPhones = readRecipientPhones(process.env.LAFAMILIA_WHATSAPP_RECIPIENT_PHONES);

  if (!phoneNumberId) {
    throw new Error("Falta LAFAMILIA_WHATSAPP_PHONE_NUMBER_ID.");
  }

  if (!apiToken) {
    throw new Error("Falta LAFAMILIA_WHATSAPP_API_TOKEN.");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: TENANT_SLUG },
    select: { id: true, name: true, slug: true },
  });

  if (!tenant) {
    throw new Error("No existe el tenant 'lafamilia'. Ejecutá primero npm run prisma:seed.");
  }

  const config = {
    phoneNumberId,
    apiToken: encrypt(apiToken),
    recipientPhones,
  };

  await prisma.tenantIntegration.upsert({
    where: {
      tenantId_provider: {
        tenantId: tenant.id,
        provider: "whatsapp",
      },
    },
    update: { config: config as Prisma.InputJsonValue },
    create: {
      tenantId: tenant.id,
      provider: "whatsapp",
      config: config as Prisma.InputJsonValue,
    },
  });

  console.log(`WhatsApp cargado para ${tenant.name} (${tenant.slug}).`);
  console.log(`  phoneNumberId: ${phoneNumberId}`);
  console.log(`  recipientPhones: ${recipientPhones.join(", ")}`);
}

function readRecipientPhones(raw: string | undefined): string[] {
  const phones = (raw ?? DEFAULT_RECIPIENT_PHONE)
    .split(",")
    .map((phone) => phone.trim())
    .filter((phone) => phone.length > 0);

  if (phones.length === 0) {
    throw new Error("LAFAMILIA_WHATSAPP_RECIPIENT_PHONES no tiene teléfonos.");
  }

  const invalid = phones.find((phone) => !/^\+\d{8,15}$/.test(phone));
  if (invalid) {
    throw new Error(`Teléfono inválido '${invalid}'. Usá formato +549...`);
  }

  return phones;
}

provisionLaFamiliaWhatsApp()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
