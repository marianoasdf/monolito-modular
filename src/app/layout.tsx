import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multi-SaaS Modular Monolith",
  description: "Base Next.js tenant-aware para una barbería multi-SaaS modular.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
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

              <nav className="site-nav" aria-label="Principal">
                <Link href="/">Inicio</Link>
                <Link href="/crown/barbershop">Demo Crown</Link>
                <Link href="/heritage/barbershop">Demo Heritage</Link>
              </nav>
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