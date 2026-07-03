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
    title: `Política de privacidad | ${tenantName}`,
    description: `Política de privacidad de ${tenantName} para pedidos, entrega y contacto por WhatsApp.`,
  };
}

export default async function RotisseriePrivacyPage({
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
        <h1>Política de privacidad</h1>
        <p className="lead">
          En {tenantName} cuidamos la información que nos compartís al hacer un pedido o
          contactarnos por WhatsApp.
        </p>

        <div className="privacy-content">
          <section>
            <h2>Información que recopilamos</h2>
            <p>
              Podemos recibir tu nombre, número de teléfono, dirección de entrega (cuando elegís
              delivery) y el detalle del pedido, como productos, cantidades y aclaraciones.
            </p>
          </section>

          <section>
            <h2>Cómo usamos la información</h2>
            <p>
              Usamos esos datos solo para confirmar y preparar tu pedido, coordinar la entrega o el
              retiro, enviarte la confirmación y mejorar la atención del negocio.
            </p>
          </section>

          <section>
            <h2>Con quién compartimos datos</h2>
            <p>
              No vendemos ni alquilamos tu información personal. Solo podemos compartirla con
              proveedores necesarios para prestar el servicio, como WhatsApp/Meta, el servicio de
              mensajería para el delivery o los medios de pago.
            </p>
          </section>

          <section>
            <h2>Conservación y baja</h2>
            <p>
              Conservamos la información mientras sea necesaria para gestionar tus pedidos. Podés
              pedir que dejemos de contactarte o que eliminemos tus datos escribiéndonos por
              WhatsApp a {tenantName}.
            </p>
          </section>

          <section>
            <h2>Contacto</h2>
            <p>
              Para consultas sobre esta política o sobre tus datos personales, escribinos por
              WhatsApp desde el sitio oficial de {tenantName}.
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
