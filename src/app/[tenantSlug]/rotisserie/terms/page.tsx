import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolvePublicTenantBySlug } from "../../../publicTenantHosts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}): Promise<Metadata> {
  const { tenantSlug } = await params;
  const tenant = resolvePublicTenantBySlug(tenantSlug);
  const tenantName = tenant?.name ?? "el negocio";

  return {
    title: `Términos y condiciones | ${tenantName}`,
    description: `Términos y condiciones de ${tenantName} para pedidos, entrega y pagos.`,
  };
}

export default async function RotisserieTermsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}): Promise<React.JSX.Element> {
  const { tenantSlug } = await params;
  const tenant = resolvePublicTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const tenantName = tenant.name;

  return (
    <section className="privacy-page">
      <article className="privacy-card">
        <p className="eyebrow">{tenantName}</p>
        <h1>Términos y condiciones</h1>
        <p className="lead">
          Estos términos regulan el uso del sitio de {tenantName} y la realización de pedidos por
          canales digitales.
        </p>

        <div className="privacy-content">
          <section>
            <h2>Pedidos y disponibilidad</h2>
            <p>
              Los pedidos quedan sujetos a disponibilidad y stock del día. {tenantName} puede
              confirmar, modificar o rechazar un pedido cuando sea necesario por razones operativas.
            </p>
          </section>

          <section>
            <h2>Precios</h2>
            <p>
              Los precios y productos publicados pueden cambiar sin aviso previo. El precio final,
              incluido el costo de envío, se confirma al momento de realizar el pedido.
            </p>
          </section>

          <section>
            <h2>Entrega y retiro</h2>
            <p>
              Ofrecemos retiro en el local y delivery según la zona de cobertura. El costo de envío
              y los tiempos de entrega dependen de la ubicación y de la demanda del momento.
            </p>
          </section>

          <section>
            <h2>Medios de pago</h2>
            <p>
              Aceptamos efectivo y transferencia. Otros medios de pago pueden habilitarse más
              adelante. El pago se coordina al confirmar el pedido.
            </p>
          </section>

          <section>
            <h2>Uso del sitio</h2>
            <p>
              El sitio debe usarse solo para consultar la carta y realizar pedidos reales.{" "}
              {tenantName} puede bloquear solicitudes abusivas, falsas o que afecten el
              funcionamiento del servicio.
            </p>
          </section>

          <section>
            <h2>Contacto</h2>
            <p>
              Para consultas sobre estos términos, pedidos o entregas, escribinos por WhatsApp desde
              el sitio oficial de {tenantName}.
            </p>
          </section>
        </div>

        <p className="privacy-updated">Última actualización: 22 de junio de 2026.</p>

        <Link className="button" href={`/${tenantSlug}/rotisserie/carta`}>
          Volver a la carta
        </Link>
      </article>
    </section>
  );
}
