import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { encrypt } from "../src/core/crypto/crypto-utils";

const prisma = new PrismaClient();

async function provision() {
  console.log("🚀 Iniciando provisioning de tenant yoni247...\n");

  // 1. Buscar tenant yoni247
  const tenant = await prisma.tenant.findUnique({
    where: { slug: "yoni247" },
  });

  if (!tenant) {
    throw new Error("❌ Tenant 'yoni247' no encontrado. Ejecutá el seed primero: npx prisma db seed");
  }

  console.log(`✅ Tenant encontrado: ${tenant.name} (id: ${tenant.id})\n`);

  // 2. Verificar variables de entorno requeridas
  const requiredEnvVars = [
    "YONI247_WHATSAPP_PHONE_NUMBER_ID",
    "YONI247_WHATSAPP_API_TOKEN",
    "YONI247_ADMIN_ACCESS_PASSWORD",
  ];

  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    throw new Error(`❌ Faltan variables de entorno: ${missingVars.join(", ")}`);
  }

  console.log("✅ Variables de entorno verificadas\n");

  // 3. TenantAuth (idempotente)
  const existingAuth = await prisma.tenantAuth.findUnique({
    where: { tenantId: tenant.id },
  });

  if (existingAuth) {
    console.log("⚠️  TenantAuth ya existe. Saltando creación.\n");
  } else {
    const passwordHash = await bcrypt.hash(process.env.YONI247_ADMIN_ACCESS_PASSWORD!, 10);

    await prisma.tenantAuth.create({
      data: {
        tenantId: tenant.id,
        adminPasswordHash: passwordHash,
      },
    });

    console.log("✅ TenantAuth creado\n");
  }

  // 4. TenantIntegration WhatsApp (idempotente)
  const existingIntegration = await prisma.tenantIntegration.findUnique({
    where: {
      tenantId_provider: {
        tenantId: tenant.id,
        provider: "whatsapp",
      },
    },
  });

  const apiTokenEncrypted = encrypt(process.env.YONI247_WHATSAPP_API_TOKEN!);

  const whatsappConfig = {
    phoneNumberId: process.env.YONI247_WHATSAPP_PHONE_NUMBER_ID,
    apiToken: apiTokenEncrypted,
    recipientPhones: ["+5493434671787", "+5493454933676"],
  };

  if (existingIntegration) {
    console.log("⚠️  TenantIntegration 'whatsapp' ya existe. Actualizando...\n");

    await prisma.tenantIntegration.update({
      where: {
        tenantId_provider: {
          tenantId: tenant.id,
          provider: "whatsapp",
        },
      },
      data: { config: whatsappConfig },
    });

    console.log("✅ TenantIntegration actualizado\n");
  } else {
    console.log("📝 Creando TenantIntegration (whatsapp):");
    console.log(`   - phoneNumberId: ${whatsappConfig.phoneNumberId}`);
    console.log(`   - recipientPhones: ${whatsappConfig.recipientPhones.join(", ")}`);
    console.log(`   - apiToken: [encriptado]\n`);

    await prisma.tenantIntegration.create({
      data: {
        tenantId: tenant.id,
        provider: "whatsapp",
        config: whatsappConfig,
      },
    });

    console.log("✅ TenantIntegration creado\n");
  }

  // 5. Verificación final
  const finalAuth = await prisma.tenantAuth.findUnique({ where: { tenantId: tenant.id } });
  const finalIntegration = await prisma.tenantIntegration.findUnique({
    where: { tenantId_provider: { tenantId: tenant.id, provider: "whatsapp" } },
  });

  console.log("📊 Estado final:");
  console.log(`   TenantAuth:                  ${finalAuth ? "✅" : "❌"}`);
  console.log(`   TenantIntegration (whatsapp): ${finalIntegration ? "✅" : "❌"}`);
  console.log("\n🎉 Provisioning de yoni247 completado!");
}

provision()
  .catch((error) => {
    console.error("\n❌ Error durante el provisioning:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
