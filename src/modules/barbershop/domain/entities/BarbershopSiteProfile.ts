export interface FeaturedBarbershopService {
  name: string;
  durationInMinutes: number;
  priceInArs: number;
}

export interface BarbershopAgendaSlot {
  startsAt: string;
  label: string;
  status: "available" | "occupied" | "closed";
  minAdvanceMinutes: number;
}

export interface BarbershopSiteProfile {
  tenantId: string;
  tenantSlug: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  neighborhood: string;
  specialty: string;
  phone: string;
  whatsAppUrl: string;
  businessHours: string;
  todayLabel: string;
  todaySlots: BarbershopAgendaSlot[];
  featuredServices: FeaturedBarbershopService[];
}