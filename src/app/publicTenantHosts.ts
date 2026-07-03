export interface PublicTenantHost {
  slug: string;
  name: string;
  hosts: string[];
}

export const PUBLIC_TENANT_HOSTS: PublicTenantHost[] = [
  {
    slug: "mgbarber",
    name: "MG Barber",
    hosts: ["mgbarber.xyz", "www.mgbarber.xyz"],
  },
  {
    slug: "rufianbarbershop",
    name: "Rufian Barbershop",
    hosts: ["rufianbarbershop.com", "www.rufianbarbershop.com"],
  },
  {
    slug: "lafamilia",
    name: "La Familia Rotisería y Viandas",
    hosts: [],
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
