import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Shell } from "./Shell";
import { resolvePublicTenantByHost, type PublicTenantHost } from "./publicTenantHosts";

type PublicSiteMetadata = {
  title: string;
  description: string;
};

function buildPublicSiteMetadata(publicTenant: PublicTenantHost | null): PublicSiteMetadata {
  if (!publicTenant) {
    return {
      title: "Reservas y pedidos online",
      description: "Sitio online para gestionar reservas, pedidos y atención de clientes.",
    };
  }

  if (publicTenant.vertical === "rotisserie") {
    return {
      title: `${publicTenant.name} | Rotisería y delivery`,
      description: "Hacé tu pedido online para retirar o recibir por delivery.",
    };
  }

  return {
    title: `${publicTenant.name} | Turnos online`,
    description: "Reservá tu turno online de forma rápida y simple.",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const publicTenant = resolvePublicTenantByHost(host);

  const metadata = buildPublicSiteMetadata(publicTenant);
  const publicSiteUrl = publicTenant?.hosts[0] ? new URL(`https://${publicTenant.hosts[0]}`) : null;

  return {
    metadataBase: publicSiteUrl ?? undefined,
    title: metadata.title,
    description: metadata.description,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: "website",
      locale: "es_AR",
      siteName: publicTenant?.name ?? "Reservas y pedidos online",
      ...(publicSiteUrl ? { url: publicSiteUrl } : {}),
    },
    twitter: {
      card: "summary",
      title: metadata.title,
      description: metadata.description,
    },
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