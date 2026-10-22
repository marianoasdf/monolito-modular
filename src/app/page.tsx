import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BarbershopTenantView } from "./[tenantSlug]/barbershop/BarbershopTenantView";
import { OrderExperience } from "./[tenantSlug]/rotisserie/OrderExperience";
import { resolvePublicTenantByHost } from "./publicTenantHosts";
import { buildGetBarbershopSiteProfileService } from "../modules/barbershop/infra/container/buildGetBarbershopSiteProfileService";
import { buildGetCatalogService } from "../modules/rotisserie/infra/container/buildGetCatalogService";
import {
  getArgentinaWeekdayKey,
  resolveWeeklyMenu,
  rotisserieSettingsSelect,
  tenantUsesWeeklyMenu,
} from "../modules/rotisserie/infra/settings/rotisserieWeeklyMenu";
import { resolveTenantContextBySlug } from "../core/tenancy/infra/resolveTenantContextBySlug";
import { prisma } from "../core/shared/infra/prisma/prismaClient";
import { PlatformHome } from "./platform/PlatformHome";

export default async function HomePage(): Promise<React.JSX.Element> {
  const headersList = await headers();
  const host = headersList.get("host");
  const publicTenant = resolvePublicTenantByHost(host);

  if (publicTenant?.vertical === "barbershop") {
    const service = buildGetBarbershopSiteProfileService();
    const site = await service.execute({ tenantSlug: publicTenant.slug });

    if (!site) {
      notFound();
    }

    return <BarbershopTenantView site={site} />;
  }

  if (publicTenant?.vertical === "rotisserie") {
    const tenantContext = await resolveTenantContextBySlug(publicTenant.slug);
    if (!tenantContext) {
      notFound();
    }
    const catalog = await buildGetCatalogService().execute({ tenantId: tenantContext.tenantId });
    const usesWeeklyMenu = tenantUsesWeeklyMenu(publicTenant.slug);
    const settings = await prisma.rotisserieTenantSettings.findUnique({
      where: { tenantId: tenantContext.tenantId },
      select: rotisserieSettingsSelect(publicTenant.slug),
    });

    return (
      <>
        <section className="agenda-intro" style={{ marginBottom: "1.5rem" }}>
          <p className="eyebrow">Carta y pedidos</p>
          <h1 className="display-title">Hacé tu pedido</h1>
        </section>
        {catalog.length === 0 ? (
          <article className="panel" style={{ padding: "1.6rem" }}>
            <p className="muted">Todavía no hay productos cargados.</p>
          </article>
        ) : (
          <OrderExperience
            tenantSlug={publicTenant.slug}
            catalog={catalog}
            deliveryFeeInCents={settings?.deliveryFeeInCents ?? 250000}
            orderBasePath=""
            {...(usesWeeklyMenu
              ? {
                  currentWeekday: getArgentinaWeekdayKey(),
                  weeklyMenu: resolveWeeklyMenu(settings?.weeklyMenu),
                }
              : {})}
          />
        )}
        <footer className="tenant-footer">
          <Link className="tenant-footer__link" href="/privacy">
            Política de privacidad
          </Link>
          <Link className="tenant-footer__link" href="/terms">
            Términos y condiciones
          </Link>
        </footer>
      </>
    );
  }

  // Panel de plataforma. Los enlaces a /{slug}/.../admin responden 404 en producción.
  return <PlatformHome showAdminLinks={process.env.NODE_ENV !== "production"} />;
}
