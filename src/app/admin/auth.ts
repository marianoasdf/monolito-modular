import { cookies } from "next/headers";
import { prisma } from "../../core/shared/infra/prisma/prismaClient";
import bcrypt from "bcrypt";

const ADMIN_SESSION_COOKIE_NAME = "mgbarber_admin_session";

export async function validateAdminPassword(password: string): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: "mgbarber" },
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

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value === "ok";
}

export async function setAdminAuthenticated(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminAuthenticated(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
}