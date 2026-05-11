export interface FeaturedBarbershopService {
  name: string;
  durationInMinutes: number;
  priceInArs: number;
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
  businessHours: string;
  highlightedSlots: string[];
  featuredServices: FeaturedBarbershopService[];
}