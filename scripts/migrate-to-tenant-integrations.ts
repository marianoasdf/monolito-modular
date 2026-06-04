import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { encrypt } from "../src/core/crypto/crypto-utils";

const prisma = new PrismaClient();

async function migrate() {
  console.log("🚀 Iniciando migración de configuración de tenant a DB...\n");

  // 1. Buscar tenant mgbarber
  const tenant = await prisma.tenant.findUnique({
    where: { slug: "mgbarber" },
  });

  if (!tenant) {
    throw new Error("❌ Tenant 'mgbarber' no encontrado en la base de datos");
  }

  console.log(`✅ Tenant encontrado: ${tenant.name} (id: ${tenant.id})\n`);

  // 2. Verificar variables de entorno requeridas
  const requiredEnvVars = [
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_API_TOKEN",
    "WHATSAPP_RECIPIENT_PHONE_NUMBER",
    "WHATSAPP_WEBHOOK_VERIFY_TOKEN",
    "ADMIN_ACCESS_PASSWORD",
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(
      `❌ Faltan variables de entorno: ${missingVars.join(", ")}`
    );
  }

  console.log("✅ Variables de entorno verificadas\n");

  // 3. Verificar si ya existe TenantAuth (idempotencia)
  const existingAuth = await prisma.tenantAuth.findUnique({
    where: { tenantId: tenant.id },
  });

  if (existingAuth) {
    console.log("⚠️  TenantAuth ya existe para este tenant. Saltando creación de auth.\n");
  } else {
    // 4. Hashear contraseña de admin
    const passwordHash = await bcrypt.hash(
      process.env.ADMIN_ACCESS_PASSWORD!,
      10
    );

    console.log("📝 Se creará TenantAuth:");
    console.log(`   - tenantId: ${tenant.id}`);
    console.log(`   - adminPasswordHash: [bcrypt hash]\n`);

    // 5. Crear TenantAuth
    await prisma.tenantAuth.create({
      data: {
        tenantId: tenant.id,
        adminPasswordHash: passwordHash,
      },
    });

    console.log("✅ TenantAuth creado exitosamente\n");
  }

  // 6. Verificar si ya existe TenantIntegration para WhatsApp (idempotencia)
  const existingIntegration = await prisma.tenantIntegration.findUnique({
    where: {
      tenantId_provider: {
        tenantId: tenant.id,
        provider: "whatsapp",
      },
    },
  });

  if (existingIntegration) {
    console.log(
      "⚠️  TenantIntegration para 'whatsapp' ya existe. Actualizando con webhookVerifyToken en texto plano...\n"
    );

    // 7. Encriptar solo apiToken de WhatsApp (webhookVerifyToken en texto plano)
    const apiTokenEncrypted = encrypt(process.env.WHATSAPP_API_TOKEN!);

    console.log("📝 Se actualizará TenantIntegration (whatsapp):");
    console.log(`   - tenantId: ${tenant.id}`);
    console.log(`   - provider: whatsapp`);
    console.log(`   - config.phoneNumberId: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);
    console.log(`   - config.recipientPhone: ${process.env.WHATSAPP_RECIPIENT_PHONE_NUMBER}`);
    console.log(`   - config.apiToken: [encriptado]`);
    console.log(`   - config.webhookVerifyToken: [texto plano]\n`);

    // 8. Actualizar TenantIntegration
    await prisma.tenantIntegration.update({
      where: {
        tenantId_provider: {
          tenantId: tenant.id,
          provider: "whatsapp",
        },
      },
      data: {
        config: {
          phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
          apiToken: apiTokenEncrypted,
          recipientPhone: process.env.WHATSAPP_RECIPIENT_PHONE_NUMBER,
          webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
        },
      },
    });

    console.log("✅ TenantIntegration actualizado exitosamente\n");
  } else {
    // 7. Encriptar solo apiToken de WhatsApp (webhookVerifyToken en texto plano)
    const apiTokenEncrypted = encrypt(process.env.WHATSAPP_API_TOKEN!);

    console.log("📝 Se creará TenantIntegration (whatsapp):");
    console.log(`   - tenantId: ${tenant.id}`);
    console.log(`   - provider: whatsapp`);
    console.log(`   - config.phoneNumberId: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);
    console.log(`   - config.recipientPhone: ${process.env.WHATSAPP_RECIPIENT_PHONE_NUMBER}`);
    console.log(`   - config.apiToken: [encriptado]`);
    console.log(`   - config.webhookVerifyToken: [texto plano]\n`);

    // 8. Crear TenantIntegration
    await prisma.tenantIntegration.create({
      data: {
        tenantId: tenant.id,
        provider: "whatsapp",
        config: {
          phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
          apiToken: apiTokenEncrypted,
          recipientPhone: process.env.WHATSAPP_RECIPIENT_PHONE_NUMBER,
          webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
        },
      },
    });

    console.log("✅ TenantIntegration creado exitosamente\n");
  }

  // 9. Verificar estado final
  const finalAuth = await prisma.tenantAuth.findUnique({
    where: { tenantId: tenant.id },
  });

  const finalIntegration = await prisma.tenantIntegration.findUnique({
    where: {
      tenantId_provider: {
        tenantId: tenant.id,
        provider: "whatsapp",
      },
    },
  });

  console.log("📊 Estado final de la migración:");
  console.log(`   TenantAuth: ${finalAuth ? "✅ Creado" : "❌ No creado"}`);
  console.log(
    `   TenantIntegration (whatsapp): ${finalIntegration ? "✅ Creado" : "❌ No creado"}`
  );
  console.log("\n🎉 Migración completada exitosamente!");
}

migrate()
  .catch((error) => {
    console.error("\n❌ Error durante la migración:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
