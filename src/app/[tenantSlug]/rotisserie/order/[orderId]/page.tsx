import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveTenantContextBySlug } from "../../../../../core/tenancy/infra/resolveTenantContextBySlug";
import { buildGetOrderService } from "../../../../../modules/rotisserie/infra/container/buildGetOrderService";

function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInCents / 100);
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
};

const FULFILLMENT_LABELS: Record<string, string> = {
  pickup: "Retiro en el local",
  delivery: "Delivery",
};

export default async function RotisserieOrderConfirmationPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; orderId: string }>;
}): Promise<React.JSX.Element> {
  const { tenantSlug, orderId } = await params;
  const tenant = await resolveTenantContextBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const service = buildGetOrderService();
  const order = await service.execute({ tenantId: tenant.tenantId, orderId });

  if (!order) {
    notFound();
  }

  return (
    <section className="privacy-page">
      <article className="privacy-card">
        <p className="eyebrow">Pedido recibido</p>
        <h1>¡Gracias, {order.customerName}!</h1>
        <p className="lead">
          Tu pedido quedó registrado. Te vamos a confirmar por WhatsApp en breve.
        </p>

        <div className="privacy-content">
          <section>
            <h2>Resumen</h2>
            <ul className="service-list">
              {order.items.map((item) => (
                <li key={item.productId}>
                  <span>
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="price">{formatPrice(item.lineTotalInCents)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="booking-summary booking-summary--selected">
              <span>Total</span>
              <strong>{formatPrice(order.totalInCents)}</strong>
            </div>
          </section>

          <section>
            <h2>Entrega y pago</h2>
            <p>
              {FULFILLMENT_LABELS[order.fulfillmentType] ?? order.fulfillmentType}
              {order.deliveryAddress ? ` · ${order.deliveryAddress}` : ""}
            </p>
            <p>Pago: {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
            {order.notes ? <p>Nota: {order.notes}</p> : null}
          </section>
        </div>

        <p className="privacy-updated">Número de pedido: {order.id}</p>

        <Link className="button" href={`/${tenantSlug}/rotisserie/carta`}>
          Volver a la carta
        </Link>
      </article>
    </section>
  );
}
