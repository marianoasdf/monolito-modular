import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveTenantContextBySlug } from "../../../../core/tenancy/infra/resolveTenantContextBySlug";
import { prisma } from "../../../../core/shared/infra/prisma/prismaClient";
import { buildGetCatalogService } from "../../../../modules/rotisserie/infra/container/buildGetCatalogService";
import { OrderExperience } from "../OrderExperience";

export default async function RotisserieCatalogPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}): Promise<React.JSX.Element> {
  const { tenantSlug } = await params;
  const tenant = await resolveTenantContextBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const service = buildGetCatalogService();
  const catalog = await service.execute({ tenantId: tenant.tenantId });
  const settings = await prisma.rotisserieTenantSettings.findUnique({
    where: { tenantId: tenant.tenantId },
    select: { deliveryFeeInCents: true },
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
        <OrderExperience tenantSlug={tenant.tenantSlug} catalog={catalog} deliveryFeeInCents={settings?.deliveryFeeInCents ?? 250000} />
      )}

      <footer className="tenant-footer">
        <Link className="tenant-footer__link" href={`/${tenantSlug}/rotisserie/privacy`}>
          Política de privacidad
        </Link>
        <Link className="tenant-footer__link" href={`/${tenantSlug}/rotisserie/terms`}>
          Términos y condiciones
        </Link>
      </footer>
    </>
  );
}
