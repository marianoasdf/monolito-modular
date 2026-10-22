import { cookies } from "next/headers";
import { prisma } from "../../core/shared/infra/prisma/prismaClient";
import bcrypt from "bcryptjs";

// Sesión de admin aislada por tenant: cada barbería tiene su propia cookie,
// así un admin logueado en un tenant no obtiene acceso a otro.
function sessionCookieName(tenantSlug: string): string {
  return `admin_session_${tenantSlug}`;
}

export type AdminPasswordAccess = "business" | "support" | "local";

export type ChangeBusinessPasswordResult = "ok" | "missing" | "wrong" | "short" | "mismatch";

const MIN_BUSINESS_PASSWORD_LENGTH = 8;

export async function matchAdminPassword(
  tenantSlug: string,
  password: string,
): Promise<AdminPasswordAccess | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });

  if (!tenant) {
    if (process.env.NODE_ENV !== "production" && password === "admin-local") {
      return "local";
    }
    return null;
  }

  const auth = await prisma.tenantAuth.findUnique({
    where: { tenantId: tenant.id },
  });

  if (auth?.adminPasswordHash && (await bcrypt.compare(password, auth.adminPasswordHash))) {
    return "business";
  }

  if (auth?.supportPasswordHash && (await bcrypt.compare(password, auth.supportPasswordHash))) {
    return "support";
  }

  if (
    !auth?.adminPasswordHash &&
    !auth?.supportPasswordHash &&
    process.env.NODE_ENV !== "production" &&
    password === "admin-local"
  ) {
    return "local";
  }

  return null;
}

export async function changeBusinessAdminPassword(
  tenantSlug: string,
  currentPassword: string,
  nextPassword: string,
  confirmPassword: string,
): Promise<ChangeBusinessPasswordResult> {
  if (nextPassword.length < MIN_BUSINESS_PASSWORD_LENGTH) {
    return "short";
  }

  if (nextPassword !== confirmPassword) {
    return "mismatch";
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });

  if (!tenant) {
    return "missing";
  }

  const auth = await prisma.tenantAuth.findUnique({
    where: { tenantId: tenant.id },
    select: { adminPasswordHash: true },
  });

  if (!auth?.adminPasswordHash) {
    return "missing";
  }

  const currentMatches = await bcrypt.compare(currentPassword, auth.adminPasswordHash);
  if (!currentMatches) {
    return "wrong";
  }

  await prisma.tenantAuth.update({
    where: { tenantId: tenant.id },
    data: { adminPasswordHash: await bcrypt.hash(nextPassword, 10) },
  });

  return "ok";
}

export async function isAdminAuthenticated(tenantSlug: string): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(sessionCookieName(tenantSlug))?.value === "ok";
}

export async function setAdminAuthenticated(tenantSlug: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName(tenantSlug), "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminAuthenticated(tenantSlug: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName(tenantSlug));
}
