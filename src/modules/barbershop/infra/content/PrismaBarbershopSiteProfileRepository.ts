import { PrismaClient } from "@prisma/client";
import {
  BarbershopSiteProfile,
  FeaturedBarbershopService,
} from "../../domain/entities/BarbershopSiteProfile";
import { BarbershopSiteProfileRepository } from "../../domain/repositories/BarbershopSiteProfileRepository";

function buildFeaturedServices(name: string): FeaturedBarbershopService[] {
  return [
    { name: `${name} Corte`, durationInMinutes: 45, priceInArs: 16000 },
    { name: `${name} Barba`, durationInMinutes: 30, priceInArs: 11000 },
    { name: `${name} Combo`, durationInMinutes: 70, priceInArs: 24000 },
  ];
}

function formatSlot(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export class PrismaBarbershopSiteProfileRepository
  implements BarbershopSiteProfileRepository
{
  constructor(private readonly prismaClient: PrismaClient) {}

  async findByTenantSlug(tenantSlug: string): Promise<BarbershopSiteProfile | null> {
    const tenant = await this.prismaClient.tenant.findUnique({
      where: { slug: tenantSlug },
      include: {
        appointments: {
          where: { status: "SCHEDULED", startsAt: { gte: new Date() } },
          orderBy: { startsAt: "asc" },
          take: 3,
        },
      },
    });

    if (!tenant) {
      return null;
    }

    const highlightedSlots =
      tenant.appointments.length > 0
        ? tenant.appointments.map((appointment) => formatSlot(appointment.startsAt))
        : ["Lun 10:00", "Lun 12:00", "Lun 16:00"];

    return {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      name: tenant.name,
      tagline: "Operación barbería conectada a Prisma",
      description:
        "Este tenant ya se resuelve desde PostgreSQL. Los textos comerciales siguen genéricos hasta definir metadata propia o seeds de demo.",
      city: "Ciudad pendiente",
      neighborhood: "Barrio pendiente",
      specialty: "agenda, clientes y turnos",
      phone: "+540000000000",
      businessHours: "Lun a Sáb · 10:00 a 20:00",
      highlightedSlots,
      featuredServices: buildFeaturedServices(tenant.name),
    };
  }
}