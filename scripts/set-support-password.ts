import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Carga o reemplaza la clave de soporte de un tenant.
 * No modifica adminPasswordHash.
 *
 * TENANT_SLUG=lafamilia SUPPORT_PASSWORD="..." npx tsx scripts/set-support-password.ts
 * ADMIN_PASSWORD solo se guarda si el negocio todavía no tiene clave.
 */
async function setSupportPassword(): Promise<void> {
  const tenantSlug = process.env.TENANT_SLUG?.trim().toLowerCase();
  const supportPassword = process.env.SUPPORT_PASSWORD ?? "";

  if (!tenantSlug) {
    throw new Error("Falta TENANT_SLUG.");
  }

  if (supportPassword.length < 8) {
    throw new Error("SUPPORT_PASSWORD tiene que tener al menos 8 caracteres.");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true, slug: true, name: true, auth: { select: { adminPasswordHash: true } } },
  });

  if (!tenant) {
    throw new Error(`No existe el tenant '${tenantSlug}'.`);
  }

  const supportPasswordHash = await bcrypt.hash(supportPassword, 10);
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const canCreateBusinessPassword = adminPassword.length > 0 && !tenant.auth?.adminPasswordHash;

  if (adminPassword.length > 0 && adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD tiene que tener al menos 8 caracteres.");
  }

  if (adminPassword.length > 0 && tenant.auth?.adminPasswordHash) {
    console.log("La clave del negocio ya existe y no se modificó.");
  }

  if (canCreateBusinessPassword && adminPassword === supportPassword) {
    throw new Error("La clave del negocio y la de soporte tienen que ser distintas.");
  }

  if (
    tenant.auth?.adminPasswordHash &&
    (await bcrypt.compare(supportPassword, tenant.auth.adminPasswordHash))
  ) {
    throw new Error("La clave de soporte no puede ser igual a la del negocio.");
  }

  await prisma.tenantAuth.upsert({
    where: { tenantId: tenant.id },
    update: {
      supportPasswordHash,
      ...(canCreateBusinessPassword
        ? { adminPasswordHash: await bcrypt.hash(adminPassword, 10) }
        : {}),
    },
    create: {
      tenantId: tenant.id,
      supportPasswordHash,
      ...(canCreateBusinessPassword
        ? { adminPasswordHash: await bcrypt.hash(adminPassword, 10) }
        : {}),
    },
  });

  console.log(`Clave de soporte actualizada para ${tenant.name} (${tenant.slug}).`);
  if (canCreateBusinessPassword) {
    console.log("Se creó la clave del negocio porque todavía no tenía una.");
  }
}

setSupportPassword()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
