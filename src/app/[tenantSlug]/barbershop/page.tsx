import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { isMgBarberPublicHost } from "../../isMgBarberPublicHost";
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

  if (tenantSlug === "mgbarber" && isMgBarberPublicHost(host)) {
    redirect("/");
  }

  const service = buildGetBarbershopSiteProfileService();
  const site = await service.execute({ tenantSlug });

  if (!site) {
    notFound();
  }

  return <BarbershopTenantView site={site} />;
}