export type PublicTenantVertical = "barbershop" | "rotisserie";

export interface PublicTenantHost {
  slug: string;
  name: string;
  hosts: string[];
  vertical: PublicTenantVertical;
}

export const PUBLIC_TENANT_HOSTS: PublicTenantHost[] = [
  {
    slug: "mgbarber",
    name: "MG Barber",
    hosts: ["mgbarber.xyz", "www.mgbarber.xyz"],
    vertical: "barbershop",
  },
  {
    slug: "rufianbarbershop",
    name: "Rufian Barbershop",
    hosts: ["rufianbarbershop.com", "www.rufianbarbershop.com"],
    vertical: "barbershop",
  },
  {
    slug: "lafamilia",
    name: "La Familia Rotisería y Viandas",
    hosts: ["lafamiliaroti.com", "www.lafamiliaroti.com"],
    vertical: "rotisserie",
  },
  {
    slug: "yoni247",
    name: "Yoni 24/7",
    hosts: ["yoni24hs.com", "www.yoni24hs.com"],
    vertical: "rotisserie",
  },
];

export function normalizePublicHost(host: string | null): string | null {
  if (!host) {
    return null;
  }

  return host.split(":")[0]?.toLowerCase() || null;
}

export function resolvePublicTenantByHost(host: string | null): PublicTenantHost | null {
  const normalizedHost = normalizePublicHost(host);

  if (!normalizedHost) {
    return null;
  }

  return PUBLIC_TENANT_HOSTS.find((tenant) => tenant.hosts.includes(normalizedHost)) ?? null;
}

export function resolvePublicTenantBySlug(slug: string | null): PublicTenantHost | null {
  if (!slug) {
    return null;
  }

  const normalizedSlug = slug.trim().toLowerCase();

  return PUBLIC_TENANT_HOSTS.find((tenant) => tenant.slug === normalizedSlug) ?? null;
}

export function isPublicTenantHost(host: string | null): boolean {
  return resolvePublicTenantByHost(host) !== null;
}
