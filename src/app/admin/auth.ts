import { cookies } from "next/headers";
import { prisma } from "../../core/shared/infra/prisma/prismaClient";
import bcrypt from "bcryptjs";

// Sesión de admin aislada por tenant: cada barbería tiene su propia cookie,
// así un admin logueado en un tenant no obtiene acceso a otro.
function sessionCookieName(tenantSlug: string): string {
  return `admin_session_${tenantSlug}`;
}

export async function validateAdminPassword(
  tenantSlug: string,
  password: string,
): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });

  if (!tenant) {
    if (process.env.NODE_ENV !== "production" && password === "admin-local") {
      return true;
    }
    return false;
  }

  const auth = await prisma.tenantAuth.findUnique({
    where: { tenantId: tenant.id },
  });

  if (!auth?.adminPasswordHash) {
    if (process.env.NODE_ENV !== "production" && password === "admin-local") {
      return true;
    }
    return false;
  }

  return await bcrypt.compare(password, auth.adminPasswordHash);
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
