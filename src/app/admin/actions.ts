"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../core/shared/infra/prisma/prismaClient";
import { normalizeBarbershopPhoneNumber } from "../../modules/barbershop/domain/value-objects/normalizeBarbershopPhoneNumber";
import {
  createDefaultWeeklySchedule,
  parseTimeList,
  WEEKDAY_FIELDS,
} from "../../modules/barbershop/infra/settings/barbershopTenantSettings";
import {
  clearAdminAuthenticated,
  isAdminAuthenticated,
  setAdminAuthenticated,
  validateAdminPassword,
} from "./auth";

export async function loginAdminAction(formData: FormData): Promise<void> {
  const password = `${formData.get("password") || ""}`;
  const isValid = await validateAdminPassword(password);

  if (!isValid) {
    redirect("/admin?error=invalid-password");
  }

  await setAdminAuthenticated();
  redirect("/admin");
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminAuthenticated();
  redirect("/admin");
}

export async function saveAdminSettingsAction(formData: FormData): Promise<void> {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin?error=auth");
  }

  const tenantSlug = `${formData.get("tenantSlug") || "mgbarber"}`;
  const publicName = `${formData.get("publicName") || ""}`.trim();
  const description = `${formData.get("description") || ""}`.trim();
  const phoneInput = `${formData.get("phone") || ""}`.trim();
  const normalizedPhone = normalizeBarbershopPhoneNumber(phoneInput);

  if (!normalizedPhone) {
    redirect("/admin?error=phone");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });

  if (!tenant) {
    redirect("/admin?error=tenant");
  }

  const weeklySchedule = createDefaultWeeklySchedule();

  for (const { fieldName, weekday } of WEEKDAY_FIELDS) {
    weeklySchedule[weekday] = parseTimeList(`${formData.get(fieldName) || ""}`);
  }

  const expressSlots = parseTimeList(`${formData.get("expressSlots") || ""}`);

  await prisma.barbershopTenantSettings.upsert({
    where: { tenantId: tenant.id },
    update: {
      publicName: publicName || null,
      description: description || null,
      phone: normalizedPhone,
      weeklySchedule,
      expressSlots,
    },
    create: {
      tenantId: tenant.id,
      publicName: publicName || null,
      description: description || null,
      phone: normalizedPhone,
      weeklySchedule,
      expressSlots,
    },
  });

  revalidatePath("/");
  revalidatePath("/mgbarber/barbershop");
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}

export async function cancelAppointmentAction(formData: FormData): Promise<void> {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin?error=auth");
  }

  const appointmentId = `${formData.get("appointmentId") || ""}`;
  const tenantId = `${formData.get("tenantId") || ""}`;

  if (!appointmentId || !tenantId) {
    redirect("/admin");
  }

  await prisma.barbershopAppointment.deleteMany({
    where: {
      id: appointmentId,
      tenantId,
    },
  });

  revalidatePath("/");
  revalidatePath("/mgbarber/barbershop");
  revalidatePath("/admin");
  redirect("/admin");
}