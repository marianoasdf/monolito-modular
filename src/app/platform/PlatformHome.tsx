import { ComingSoonCard } from "./ComingSoonCard";
import { PLATFORM_TAGLINE } from "./platformBrand";
import { SectionHeader } from "./SectionHeader";
import { StatTile } from "./StatTile";
import { TenantCard } from "./TenantCard";
import {
  DEMO_PLATFORM_TENANTS,
  PLATFORM_TENANTS,
  countByVertical,
} from "./tenantsDirectory";
import { UPCOMING_VERTICALS } from "./verticals";

interface PlatformHomeProps {
  showAdminLinks: boolean;
}

const GRID = "mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

export function PlatformHome({ showAdminLinks }: PlatformHomeProps): React.JSX.Element {
  const withDomain = PLATFORM_TENANTS.filter((tenant) => tenant.hosts.length > 0).length;

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="pm-title">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Panel de control</p>
        <h1 id="pm-title" className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Negocios de la plataforma
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
          {PLATFORM_TAGLINE} Cada negocio tiene su sitio público, su panel y su configuración, sin
          mezclarse con los demás.
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="En producción"
            value={PLATFORM_TENANTS.length}
            hint={`${withDomain} con dominio propio`}
          />
          <StatTile label="Barberías" value={countByVertical(PLATFORM_TENANTS, "barbershop")} />
          <StatTile label="Gastronomía" value={countByVertical(PLATFORM_TENANTS, "rotisserie")} />
          <StatTile label="Rubros próximos" value={UPCOMING_VERTICALS.length} />
        </dl>
      </section>

      <section aria-labelledby="negocios">
        <SectionHeader
          id="negocios"
          title="En producción"
          description="Negocios reales que operan sobre la plataforma."
          count={PLATFORM_TENANTS.length}
        />
        {PLATFORM_TENANTS.length === 0 ? (
          <EmptyState message="Todavía no hay negocios declarados en la plataforma." />
        ) : (
          <div className={GRID}>
            {PLATFORM_TENANTS.map((tenant) => (
              <TenantCard key={tenant.slug} tenant={tenant} showAdminLink={showAdminLinks} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="demo">
        <SectionHeader
          id="demo"
          title="Demo"
          description="Tenants de prueba para mostrar la plataforma. Usan datos de demostración."
          count={DEMO_PLATFORM_TENANTS.length}
        />
        <div className={GRID}>
          {DEMO_PLATFORM_TENANTS.map((tenant) => (
            <TenantCard key={tenant.slug} tenant={tenant} showAdminLink={showAdminLinks} />
          ))}
        </div>
      </section>

      <section aria-labelledby="rubros">
        <SectionHeader
          id="rubros"
          title="Próximos rubros"
          description="Verticales planificadas sobre la misma base multi-tenant."
        />
        <div className={GRID}>
          {UPCOMING_VERTICALS.map((item) => (
            <ComingSoonCard key={item.vertical} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }): React.JSX.Element {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
      {message}
    </div>
  );
}
