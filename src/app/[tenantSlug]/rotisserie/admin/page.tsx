import { notFound } from "next/navigation";
import { prisma } from "../../../../core/shared/infra/prisma/prismaClient";
import { RotisserieAdminPanel } from "../../../admin/RotisserieAdminPanel";

export default async function TenantRotisserieAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const { tenantSlug } = await params;

  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: { rotisserieCategories: true },
  });

  if (!tenant || tenant.rotisserieCategories.length === 0) {
    notFound();
  }

  const query = await searchParams;
  return <RotisserieAdminPanel tenantSlug={tenantSlug} basePath={`/${tenantSlug}/rotisserie/admin`} query={query} />;
}
