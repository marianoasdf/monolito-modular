import { PUBLIC_TENANT_HOSTS, type PublicTenantVertical } from "../publicTenantHosts";

/**
 * Directorio de tenants que muestra el panel de plataforma.
 *
 * Los tenants reales salen de `PUBLIC_TENANT_HOSTS` (fuente única de slug,
 * nombre, rubro y dominios). Acá solo se agrega metadata de presentación.
 * Los demo no tienen host público, así que se listan aparte.
 * El panel no consulta la base: la lista es estática y sin estados de carga.
 */

export interface PlatformTenant {
  slug: string;
  name: string;
  vertical: PublicTenantVertical;
  hosts: string[];
  description: string;
  location: string | null;
  isDemo: boolean;
  /** Ruta local al sitio público del tenant. */
  siteHref: string;
  /** Ruta local al panel admin del tenant (solo disponible fuera de producción). */
  adminHref: string;
}

interface TenantPresentation {
  description: string;
  location?: string;
}

const PRESENTATION_BY_SLUG: Record<string, TenantPresentation> = {
  mgbarber: {
    description: "Turnos online con pago en efectivo o Mercado Pago y aviso por WhatsApp.",
  },
  rufianbarbershop: {
    description: "Agenda diaria con reserva online y confirmación al cliente.",
  },
  lafamilia: {
    description: "Carta completa de viandas y rotisería, con menú semanal.",
  },
  yoni247: {
    description: "Carta, pedidos para retiro o delivery y notificaciones automáticas por WhatsApp.",
  },
};

const DEFAULT_DESCRIPTION: Record<PublicTenantVertical, string> = {
  barbershop: "Turnos online para un local con una agenda.",
  rotisserie: "Carta y pedidos online para retiro o delivery.",
};

interface DemoTenantSeed {
  slug: string;
  name: string;
  location: string;
  description: string;
}

const DEMO_TENANTS: DemoTenantSeed[] = [
  {
    slug: "crown",
    name: "Crown Barbers",
    location: "CABA",
    description: "Turnos y experiencia premium.",
  },
  {
    slug: "heritage",
    name: "Heritage Cuts",
    location: "Rosario",
    description: "Equipo, membresías y recompra.",
  },
  {
    slug: "northline",
    name: "Northline Studio",
    location: "Córdoba",
    description: "Operación compacta para una sucursal.",
  },
];

export function buildSiteHref(slug: string, vertical: PublicTenantVertical): string {
  return vertical === "rotisserie" ? `/${slug}/rotisserie/carta` : `/${slug}/barbershop`;
}

export function buildAdminHref(slug: string, vertical: PublicTenantVertical): string {
  return vertical === "rotisserie" ? `/${slug}/rotisserie/admin` : `/${slug}/barbershop/admin`;
}

export const PLATFORM_TENANTS: PlatformTenant[] = PUBLIC_TENANT_HOSTS.map((tenant) => {
  const presentation = PRESENTATION_BY_SLUG[tenant.slug];

  return {
    slug: tenant.slug,
    name: tenant.name,
    vertical: tenant.vertical,
    hosts: tenant.hosts,
    description: presentation?.description ?? DEFAULT_DESCRIPTION[tenant.vertical],
    location: presentation?.location ?? null,
    isDemo: false,
    siteHref: buildSiteHref(tenant.slug, tenant.vertical),
    adminHref: buildAdminHref(tenant.slug, tenant.vertical),
  };
});

export const DEMO_PLATFORM_TENANTS: PlatformTenant[] = DEMO_TENANTS.map((tenant) => ({
  slug: tenant.slug,
  name: tenant.name,
  vertical: "barbershop",
  hosts: [],
  description: tenant.description,
  location: tenant.location,
  isDemo: true,
  siteHref: buildSiteHref(tenant.slug, "barbershop"),
  adminHref: buildAdminHref(tenant.slug, "barbershop"),
}));

export function countByVertical(
  tenants: PlatformTenant[],
  vertical: PublicTenantVertical,
): number {
  return tenants.filter((tenant) => tenant.vertical === vertical).length;
}
