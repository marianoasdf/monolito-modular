import { PrismaClient } from "@prisma/client";
import { encrypt } from "../src/core/crypto/crypto-utils";

const prisma = new PrismaClient();

async function provision() {
  console.log("Iniciando provisioning de Mercado Pago para mgbarber...\n");

  const tenant = await prisma.tenant.findUnique({
    where: { slug: "mgbarber" },
  });

  if (!tenant) {
    throw new Error("Tenant 'mgbarber' no encontrado. Ejecutá el seed primero: npx prisma db seed");
  }

  const requiredEnvVars = ["MERCADOPAGO_PUBLIC_KEY", "MERCADOPAGO_ACCESS_TOKEN"];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missingVars.join(", ")}`);
  }

  const mercadopagoConfig = {
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY!,
    accessToken: encrypt(process.env.MERCADOPAGO_ACCESS_TOKEN!),
  };

  await prisma.tenantIntegration.upsert({
    where: {
      tenantId_provider: {
        tenantId: tenant.id,
        provider: "mercadopago",
      },
    },
    update: {
      config: mercadopagoConfig,
    },
    create: {
      tenantId: tenant.id,
      provider: "mercadopago",
      config: mercadopagoConfig,
    },
  });

  const finalIntegration = await prisma.tenantIntegration.findUnique({
    where: {
      tenantId_provider: {
        tenantId: tenant.id,
        provider: "mercadopago",
      },
    },
  });

  console.log("Mercado Pago provisionado correctamente");
  console.log(`Tenant: ${tenant.name} (${tenant.id})`);
  console.log(`Provider: mercadopago`);
  console.log(`Public Key: ${mercadopagoConfig.publicKey.slice(0, 12)}...`);
  console.log(`Access Token: [encriptado]`);
  console.log(`TenantIntegration: ${finalIntegration ? "OK" : "ERROR"}`);
}

provision()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
