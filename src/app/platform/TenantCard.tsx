import Link from "next/link";
import type { PlatformTenant } from "./tenantsDirectory";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, FOCUS_RING } from "./ui";
import { VERTICALS } from "./verticals";
import { VerticalBadge } from "./VerticalBadge";

interface TenantCardProps {
  tenant: PlatformTenant;
  /** Las rutas `/{slug}/.../admin` responden 404 en producción; el enlace solo se muestra en local. */
  showAdminLink: boolean;
}

function StatusChip({ tenant }: { tenant: PlatformTenant }): React.JSX.Element {
  if (tenant.isDemo) {
    return (
      <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
        Demo
      </span>
    );
  }

  const primaryHost = tenant.hosts[0];

  if (!primaryHost) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-500">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" aria-hidden="true" />
        Sin dominio propio
      </span>
    );
  }

  return (
    <a
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 ${FOCUS_RING}`}
      href={`https://${primaryHost}`}
      target="_blank"
      rel="noreferrer"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      {primaryHost}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

export function TenantCard({ tenant, showAdminLink }: TenantCardProps): React.JSX.Element {
  const vertical = VERTICALS[tenant.vertical];
  const surface = tenant.isDemo ? "bg-zinc-50" : "bg-white";

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 ${surface} transition-shadow hover:border-zinc-300 hover:shadow-sm`}
    >
      <span className={`h-1 ${vertical.markerClassName}`} aria-hidden="true" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <VerticalBadge vertical={tenant.vertical} />
          <StatusChip tenant={tenant} />
        </div>

        <h3 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900">{tenant.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500">{tenant.description}</p>

        <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Ruta</dt>
            <dd className="font-mono text-zinc-600">{tenant.siteHref}</dd>
          </div>
          {tenant.location && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Ubicación</dt>
              <dd>{tenant.location}</dd>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Servicio</dt>
            <dd>{vertical.offering}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col gap-2 border-t border-zinc-100 pt-4 sm:flex-row">
          <Link className={`${BUTTON_PRIMARY} sm:flex-1`} href={tenant.siteHref}>
            Abrir sitio
          </Link>
          {showAdminLink && (
            <Link className={`${BUTTON_SECONDARY} sm:flex-1`} href={tenant.adminHref}>
              Panel admin
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
