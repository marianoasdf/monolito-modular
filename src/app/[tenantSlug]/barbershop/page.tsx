import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { resolvePublicTenantByHost } from "../../publicTenantHosts";
import { buildGetBarbershopSiteProfileService } from "../../../modules/barbershop/infra/container/buildGetBarbershopSiteProfileService";
import { BarbershopTenantView } from "./BarbershopTenantView";

export default async function BarbershopTenantPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}): Promise<React.JSX.Element> {
  const { tenantSlug } = await params;
  const headersList = await headers();
  const host = headersList.get("host");
  const publicTenant = resolvePublicTenantByHost(host);

  if (publicTenant?.slug === tenantSlug) {
    redirect("/");
  }

  const service = buildGetBarbershopSiteProfileService();
  const site = await service.execute({ tenantSlug });

  if (!site) {
    notFound();
  }

  return <BarbershopTenantView site={site} />;
}