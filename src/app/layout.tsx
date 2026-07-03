import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Shell } from "./Shell";
import { resolvePublicTenantByHost } from "./publicTenantHosts";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const publicTenant = resolvePublicTenantByHost(host);

  return {
    title: publicTenant ? `${publicTenant.name} | reservas` : "Multi-SaaS Modular Monolith",
    description: "Base Next.js tenant-aware para una barbería multi-SaaS modular.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const headersList = await headers();
  const host = headersList.get("host");
  const isPublicTenantHost = resolvePublicTenantByHost(host) !== null;

  return (
    <html lang="es">
      <body>
        <Shell isPublicTenantHost={isPublicTenantHost}>{children}</Shell>
      </body>
    </html>
  );
}