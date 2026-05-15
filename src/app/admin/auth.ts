import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE_NAME = "mgbarber_admin_session";

export function getAdminAccessPassword(): string | null {
  const configuredPassword = process.env.ADMIN_ACCESS_PASSWORD?.trim();

  if (configuredPassword) {
    return configuredPassword;
  }

  if (process.env.NODE_ENV !== "production") {
    return "admin-local";
  }

  return null;
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