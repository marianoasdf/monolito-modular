import { notFound } from "next/navigation";
import { prisma } from "../../../../core/shared/infra/prisma/prismaClient";
import { AdminPanel } from "../../../admin/AdminPanel";

export default async function TenantBarbershopAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const { tenantSlug } = await params;

  // En prod la única URL de admin es /admin (limpio, tenant por dominio).
  // Esta ruta explícita existe solo para local, donde no hay dominio de tenant,
  // así que en producción no debe existir.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  // Solo tenants de barbería (los que tienen settings del módulo) exponen este panel.
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: { settings: true },
  });

  if (!tenant || !tenant.settings) {
    notFound();
  }

  const query = await searchParams;
  return (
    <AdminPanel
      tenantSlug={tenantSlug}
      basePath={`/${tenantSlug}/barbershop/admin`}
      query={query}
    />
  );
}
