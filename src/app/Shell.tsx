"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps): React.JSX.Element {
  const pathname = usePathname();
  const isMgBarberPath = pathname?.startsWith("/mgbarber") ?? false;
  const isMgBarberDomain = typeof window !== "undefined" && 
    (window.location.hostname === "mgbarber.xyz" || 
     window.location.hostname === "www.mgbarber.xyz");
  const isMgBarber = isMgBarberPath || isMgBarberDomain;

  return (
    <div className="shell">
      {!isMgBarber && (
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
      {!isMgBarber && (
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
