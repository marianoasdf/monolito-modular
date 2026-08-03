import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "../../core/shared/infra/prisma/prismaClient";
import { resolvePublicTenantByHost } from "../publicTenantHosts";
import { AdminPanel } from "./AdminPanel";
import { RotisserieAdminPanel } from "./RotisserieAdminPanel";

export default async function AdminIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  // En local no hay dominio que identifique al tenant: usamos la ruta explícita.
  if (process.env.NODE_ENV !== "production") {
    redirect("/mgbarber/barbershop/admin");
  }

  // En prod el host identifica al negocio (mgbarber.xyz -> mgbarber), así que
  // /admin es el atajo limpio y único. Si el host no resuelve, caemos a mgbarber
  // para preservar el comportamiento previo (nunca redirigimos: evita loops).
  const headersList = await headers();
  const host = headersList.get("host");
  const publicTenant = resolvePublicTenantByHost(host);
  const slug = publicTenant?.slug ?? "mgbarber";

  if (publicTenant?.vertical === "rotisserie") {
    const query = await searchParams;
    return <RotisserieAdminPanel tenantSlug={slug} basePath="/admin" query={query} />;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: { settings: true },
  });

  if (!tenant || !tenant.settings) {
    notFound();
  }

  const query = await searchParams;
  return <AdminPanel tenantSlug={slug} basePath="/admin" query={query} />;
}
