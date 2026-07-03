import { Prisma, PrismaClient } from "@prisma/client";
import {
  BarbershopAgendaSlot,
  BarbershopSiteProfile,
  FeaturedBarbershopService,
} from "../../domain/entities/BarbershopSiteProfile";
import { BarbershopSiteProfileRepository } from "../../domain/repositories/BarbershopSiteProfileRepository";
import {
  ARGENTINA_OFFSET,
  ARGENTINA_TIME_ZONE,
  DEFAULT_MIN_ADVANCE_MINUTES,
  EXPRESS_MIN_ADVANCE_MINUTES,
  resolveExpressSlots,
  resolveWeeklySchedule,
} from "../settings/barbershopTenantSettings";

function buildFeaturedServices(): FeaturedBarbershopService[] {
  return [
    { name: "corte", durationInMinutes: 60, priceInArs: 15 },
    { name: "barba", durationInMinutes: 30, priceInArs: 10 },
    { name: "combo", durationInMinutes: 90, priceInArs: 20 },
  ];
}

function formatSlot(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: ARGENTINA_TIME_ZONE,
  }).format(date);
}

function getArgentinaDateParts(date: Date): { year: string; month: string; day: string } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ARGENTINA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Could not determine Argentina local date");
  }

  return { year, month, day };
}

function buildArgentinaDate(year: string, month: string, day: string, time: string): Date {
  return new Date(`${year}-${month}-${day}T${time}:00${ARGENTINA_OFFSET}`);
}

function buildWhatsAppUrl(phone: string): string {
  const phoneDigits = phone.replace(/\D/g, "");
  return `https://wa.me/${phoneDigits}`;
}

function buildTodayLabel(date: Date): string {
  const formatted = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: ARGENTINA_TIME_ZONE,
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function buildTodaySlots(params: {
  appointments: Array<{ startsAt: Date }>;
  now: Date;
  weeklySchedule: Record<number, string[]>;
  expressBookingSlots: string[];
}): BarbershopAgendaSlot[] {
  const { appointments, expressBookingSlots, now, weeklySchedule } = params;
  const { year, month, day } = getArgentinaDateParts(now);
  const referenceDate = buildArgentinaDate(year, month, day, "12:00");
  const weekday = referenceDate.getUTCDay();
  const configuredSlots = weeklySchedule[weekday] ?? [];
  const occupiedStartsAt = new Set(
    appointments.map((appointment) => appointment.startsAt.toISOString()),
  );
  const expressBookingSlotSet = new Set(expressBookingSlots);

  return configuredSlots.map((time) => {
    const slotDate = buildArgentinaDate(year, month, day, time);
    const minAdvanceMinutes = expressBookingSlotSet.has(time)
      ? EXPRESS_MIN_ADVANCE_MINUTES
      : DEFAULT_MIN_ADVANCE_MINUTES;
    const minBookableDate = new Date(now.getTime() + minAdvanceMinutes * 60 * 1000);
    const isOccupied = occupiedStartsAt.has(slotDate.toISOString());
    const isClosedByAdvanceWindow = slotDate.getTime() < minBookableDate.getTime();
    const status = isOccupied
      ? "occupied"
      : isClosedByAdvanceWindow
        ? "closed"
        : "available";

    return {
      startsAt: slotDate.toISOString(),
      label: formatSlot(slotDate),
      status,
      minAdvanceMinutes,
    };
  });
}

interface BarbershopTenantSettingsRecord {
  phone: string | null;
  weeklySchedule: Prisma.JsonValue | null;
  expressSlots: Prisma.JsonValue | null;
  publicName: string | null;
  description: string | null;
  mapsUrl: string | null;
}

export class PrismaBarbershopSiteProfileRepository
  implements BarbershopSiteProfileRepository
{
  constructor(private readonly prismaClient: PrismaClient) {}

  async findByTenantSlug(tenantSlug: string): Promise<BarbershopSiteProfile | null> {
    const now = new Date();
    const { year, month, day } = getArgentinaDateParts(now);
    const dayStart = buildArgentinaDate(year, month, day, "00:00");
    const nextDayStart = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const tenant = await this.prismaClient.tenant.findUnique({
      where: { slug: tenantSlug },
      include: {
        appointments: {
          where: {
            status: "SCHEDULED",
            startsAt: {
              gte: dayStart,
              lt: nextDayStart,
            },
          },
          orderBy: { startsAt: "asc" },
        },
      },
    });

    if (!tenant) {
      return null;
    }

    const settingsRows = await this.prismaClient.$queryRaw<BarbershopTenantSettingsRecord[]>`
      SELECT
        phone,
        "weeklySchedule" AS "weeklySchedule",
        "expressSlots" AS "expressSlots",
        "publicName" AS "publicName",
        description,
        "mapsUrl" AS "mapsUrl"
      FROM barbershop_tenant_settings
      WHERE "tenantId" = ${tenant.id}
      LIMIT 1
    `;
    const settings = settingsRows[0] ?? null;

    const phone = settings?.phone;
    if (!phone) {
      throw new Error(`Tenant ${tenant.slug} no tiene teléfono configurado. Configúralo en BarbershopTenantSettings.phone`);
    }
    const weeklySchedule = resolveWeeklySchedule(settings?.weeklySchedule);
    const expressBookingSlots = resolveExpressSlots(settings?.expressSlots);
    const publicName = settings?.publicName?.trim() || tenant.name;
    const description = settings?.description?.trim() || "";
    const mapsUrl = settings?.mapsUrl?.trim() || null;
    const todaySlots = buildTodaySlots({
      appointments: tenant.appointments,
      expressBookingSlots,
      now,
      weeklySchedule,
    });

    return {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      name: publicName,
      tagline: "Autoagenda rápida",
      description,
      mapsUrl,
      city: "Tu zona",
      neighborhood: "Atención por turnos",
      specialty: "cortes del día",
      phone,
      whatsAppUrl: buildWhatsAppUrl(phone),
      businessHours: "Lun a Sáb · 10:00 a 20:00",
      todayLabel: buildTodayLabel(now),
      todaySlots,
      featuredServices: buildFeaturedServices(),
    };
  }
}