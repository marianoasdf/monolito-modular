"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PUBLIC_TENANT_HOSTS } from "./publicTenantHosts";

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

  return (
    <div className="shell">
      {!isPublicTenant && (
        <header className="site-header">
          <div className="site-header__inner">
            <Link className="brand" href="/">
              <span className="brand__mark">BM</span>
              <span>Barber Modular</span>
            </Link>
            <nav className="site-nav" aria-label="Principal">
              <Link href="/">Inicio</Link>
              <Link href="/crown/barbershop">Demo Crown</Link>
              <Link href="/heritage/barbershop">Demo Heritage</Link>
            </nav>
          </div>
        </header>
      )}
      <main className="site-main">{children}</main>
      {!isPublicTenant && (
        <footer className="site-footer">
          <div className="site-footer__inner">
            <span>Next.js App Router + arquitectura modular</span>
            <span>Tenant-aware desde el primer día</span>
          </div>
        </footer>
      )}
    </div>
  );
}
