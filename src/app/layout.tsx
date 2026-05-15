import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { isMgBarberPublicHost } from "./isMgBarberPublicHost";
import { SiteHeaderNav } from "./SiteHeaderNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multi-SaaS Modular Monolith",
  description: "Base Next.js tenant-aware para una barbería multi-SaaS modular.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const headersList = await headers();
  const host = headersList.get("host");
  const isPublicMgBarberHost = isMgBarberPublicHost(host);

  return (
    <html lang="es">
      <body>
        <div className="shell">
          <header className="site-header">
            <div className="site-header__inner">
              <Link className="brand" href="/">
                <span className="brand__mark">BM</span>
                <span>Barber Modular</span>
              </Link>

              <SiteHeaderNav isPublicMgBarberHost={isPublicMgBarberHost} />
            </div>
          </header>

          <main className="site-main">{children}</main>

          <footer className="site-footer">
            <div className="site-footer__inner">
              <span>Next.js App Router + arquitectura modular</span>
              <span>Tenant-aware desde el primer día</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}