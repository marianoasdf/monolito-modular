import Link from "next/link";

export default function TenantLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}>): Promise<React.JSX.Element> {
  return params.then(({ tenantSlug }) => {
    if (tenantSlug === "mgbarber") {
      return <>{children}</>;
    }

    return (
      <div className="tenant-layout">
        <div className="pill">Tenant activo: {tenantSlug}</div>
        <nav className="site-nav" aria-label="Tenant">
          <Link href={`/${tenantSlug}/barbershop`}>Inicio barbería</Link>
          <Link href="/">Cambiar tenant</Link>
        </nav>
        {children}
      </div>
    );
  });
}