"use client";

import { usePathname } from "next/navigation";
import { PUBLIC_TENANT_HOSTS } from "./publicTenantHosts";
import { platformFont } from "./platform/fonts";
import { PlatformFooter } from "./platform/PlatformFooter";
import { PlatformHeader } from "./platform/PlatformHeader";
import { CONTAINER } from "./platform/ui";

interface ShellProps {
  children: React.ReactNode;
  /** Resuelto en el servidor desde el Host header; evita flash de navbar en dominios tenant. */
  isPublicTenantHost?: boolean;
}

export function Shell({ children, isPublicTenantHost = false }: ShellProps): React.JSX.Element {
  const pathname = usePathname();
  const isPublicTenantPath =
    PUBLIC_TENANT_HOSTS.some((tenant) => pathname?.startsWith(`/${tenant.slug}`)) ?? false;
  const isLegalPath = pathname?.startsWith("/privacy") || pathname?.startsWith("/terms") || false;
  const isPublicTenant = isPublicTenantPath || isLegalPath || isPublicTenantHost;

  // Sitios de tenant: sin header ni footer de plataforma, con el CSS clásico intacto.
  if (isPublicTenant) {
    return (
      <div className="shell">
        <main className="site-main">{children}</main>
      </div>
    );
  }

  // Panel de plataforma: sistema visual propio (Tailwind), acotado a `.pm-root`.
  if (pathname === "/") {
    return (
      <div className={`${PLATFORM_SCOPE} flex min-h-screen flex-col bg-[#f7f7f8]`}>
        <PlatformHeader />
        <main className={`${CONTAINER} flex-1 py-8 lg:py-10`}>{children}</main>
        <PlatformFooter />
      </div>
    );
  }

  // Rutas sin host ni slug público (tenants demo, 404): header y footer de
  // plataforma, contenido con el CSS clásico para no alterar esas páginas.
  return (
    <div className="shell flex min-h-screen flex-col">
      <div className={PLATFORM_SCOPE}>
        <PlatformHeader />
      </div>
      <main className="site-main flex-1">{children}</main>
      <div className={PLATFORM_SCOPE}>
        <PlatformFooter />
      </div>
    </div>
  );
}

const PLATFORM_SCOPE = `pm-root ${platformFont.className} text-zinc-900 antialiased`;
