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

function resolveBasePath(formData: FormData): string {
  const raw = `${formData.get("basePath") || ""}`.trim();

  // Evita open redirects: solo rutas internas absolutas.
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }

  return "/admin";
}

function resolveTenantSlug(formData: FormData): string {
  const raw = `${formData.get("tenantSlug") || ""}`.trim();
  return raw || "mgbarber";
}

export async function loginAdminAction(formData: FormData): Promise<void> {
  const basePath = resolveBasePath(formData);
  const tenantSlug = resolveTenantSlug(formData);
  const password = `${formData.get("password") || ""}`;
  const isValid = await validateAdminPassword(tenantSlug, password);

  if (!isValid) {
    redirect(`${basePath}?error=invalid-password`);
  }

  await setAdminAuthenticated(tenantSlug);
  redirect(basePath);
}

export async function logoutAdminAction(formData: FormData): Promise<void> {
  const basePath = resolveBasePath(formData);
  const tenantSlug = resolveTenantSlug(formData);
  await clearAdminAuthenticated(tenantSlug);
  redirect(basePath);
}

export async function saveAdminSettingsAction(formData: FormData): Promise<void> {
  const basePath = resolveBasePath(formData);
  const tenantSlug = resolveTenantSlug(formData);
  const authenticated = await isAdminAuthenticated(tenantSlug);

  if (!authenticated) {
    redirect(`${basePath}?error=auth`);
  }

  const publicName = `${formData.get("publicName") || ""}`.trim();
  const description = `${formData.get("description") || ""}`.trim();
  const mapsUrl = `${formData.get("mapsUrl") || ""}`.trim();
  const phoneInput = `${formData.get("phone") || ""}`.trim();
  const normalizedPhone = normalizeBarbershopPhoneNumber(phoneInput);

  if (!normalizedPhone) {
    redirect(`${basePath}?error=phone`);
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });

  if (!tenant) {
    redirect(`${basePath}?error=tenant`);
  }

  const weeklySchedule = createDefaultWeeklySchedule();

  for (const { fieldName, weekday } of WEEKDAY_FIELDS) {
    weeklySchedule[weekday] = parseTimeList(`${formData.get(fieldName) || ""}`);
  }

  const expressSlots = parseTimeList(`${formData.get("expressSlots") || ""}`);

  const normalizedMapsUrl = /^https?:\/\//i.test(mapsUrl) ? mapsUrl : null;

  await prisma.barbershopTenantSettings.upsert({
    where: { tenantId: tenant.id },
    update: {
      publicName: publicName || null,
      description: description || null,
      mapsUrl: normalizedMapsUrl,
      phone: normalizedPhone,
      weeklySchedule,
      expressSlots,
    },
    create: {
      tenantId: tenant.id,
      publicName: publicName || null,
      description: description || null,
      mapsUrl: normalizedMapsUrl,
      phone: normalizedPhone,
      weeklySchedule,
      expressSlots,
    },
  });

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/barbershop`);
  revalidatePath(basePath);
  redirect(`${basePath}?saved=1`);
}

export async function saveRotisserieAdminAction(formData: FormData): Promise<void> {
  const basePath = resolveBasePath(formData);
  const tenantSlug = resolveTenantSlug(formData);
  const authenticated = await isAdminAuthenticated(tenantSlug);

  if (!authenticated) {
    redirect(`${basePath}?error=auth`);
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });

  if (!tenant) {
    redirect(`${basePath}?error=tenant`);
  }

  const deliveryFeeInPesos = Number(`${formData.get("deliveryFeeInPesos") || "0"}`);
  const deliveryFeeInCents = Number.isFinite(deliveryFeeInPesos) && deliveryFeeInPesos >= 0 ? Math.round(deliveryFeeInPesos * 100) : 250000;

  await prisma.rotisserieTenantSettings.upsert({
    where: { tenantId: tenant.id },
    update: { deliveryFeeInCents },
    create: { tenantId: tenant.id, deliveryFeeInCents },
  });

  const productIds = [...formData.keys()]
    .filter((key) => key.startsWith("productId:"))
    .map((key) => `${formData.get(key) || ""}`)
    .filter(Boolean);

  for (const productId of productIds) {
    const priceInPesos = Number(`${formData.get(`price:${productId}`) || "0"}`);
    const stockRaw = `${formData.get(`stock:${productId}`) || ""}`.trim();
    const stockQuantity = stockRaw === "" ? null : Number(stockRaw);
    const isAvailable = `${formData.get(`available:${productId}`) || "yes"}` === "yes";

    await prisma.rotisserieProduct.updateMany({
      where: { id: productId, tenantId: tenant.id },
      data: {
        priceInCents: Number.isFinite(priceInPesos) && priceInPesos >= 0 ? Math.round(priceInPesos * 100) : 0,
        stockQuantity: stockQuantity !== null && Number.isFinite(stockQuantity) && stockQuantity >= 0 ? Math.floor(stockQuantity) : null,
        isAvailable,
      },
    });
  }

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/rotisserie/carta`);
  revalidatePath(basePath);
  redirect(`${basePath}?saved=1`);
}

export async function cancelAppointmentAction(formData: FormData): Promise<void> {
  const basePath = resolveBasePath(formData);
  const tenantSlug = resolveTenantSlug(formData);
  const authenticated = await isAdminAuthenticated(tenantSlug);

  if (!authenticated) {
    redirect(`${basePath}?error=auth`);
  }

  const appointmentId = `${formData.get("appointmentId") || ""}`;
  const tenantId = `${formData.get("tenantId") || ""}`;

  if (!appointmentId || !tenantId) {
    redirect(basePath);
  }

  await prisma.barbershopAppointment.deleteMany({
    where: {
      id: appointmentId,
      tenantId,
    },
  });

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/barbershop`);
  revalidatePath(basePath);
  redirect(basePath);
}