"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CatalogView } from "../../../modules/rotisserie/application/services/GetCatalogService";
import { MAX_UNITS_PER_PRODUCT } from "../../../modules/rotisserie/domain/value-objects/orderTypes";

type FulfillmentType = "pickup" | "delivery";
type PaymentMethod = "cash" | "transfer";

interface OrderExperienceProps {
  tenantSlug: string;
  catalog: CatalogView;
  orderBasePath?: string;
  deliveryFeeInCents?: number;
}

interface ProductInfo {
  id: string;
  name: string;
  priceInCents: number;
  stockQuantity?: number;
}

function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInCents / 100);
}

export function OrderExperience({ tenantSlug, catalog, orderBasePath, deliveryFeeInCents = 250000 }: OrderExperienceProps): React.JSX.Element {
  const resolvedOrderBasePath = orderBasePath ?? `/${tenantSlug}/rotisserie`;
  const router = useRouter();

  const productIndex = useMemo(() => {
    const index = new Map<string, ProductInfo>();
    for (const category of catalog) {
      for (const product of category.products) {
        index.set(product.id, {
          id: product.id,
          name: product.name,
          priceInCents: product.priceInCents,
          stockQuantity: product.stockQuantity,
        });
      }
    }
    return index;
  }, [catalog]);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const cartLines = useMemo(() => {
    return Object.entries(cart)
      .filter(([, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = productIndex.get(productId);
        return product ? { product, quantity } : null;
      })
      .filter((line): line is { product: ProductInfo; quantity: number } => line !== null);
  }, [cart, productIndex]);

  const subtotalInCents = cartLines.reduce(
    (sum, line) => sum + line.product.priceInCents * line.quantity,
    0,
  );
  const resolvedDeliveryFeeInCents = fulfillmentType === "delivery" ? deliveryFeeInCents : 0;
  const totalInCents = subtotalInCents + resolvedDeliveryFeeInCents;

  const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  function changeQuantity(productId: string, delta: number): void {
    setCart((current) => {
      const next = { ...current };
      const product = productIndex.get(productId);
      const requestedQuantity = (next[productId] ?? 0) + delta;
      const stockCap = product?.stockQuantity;
      const cap = stockCap !== undefined ? Math.min(stockCap, MAX_UNITS_PER_PRODUCT) : MAX_UNITS_PER_PRODUCT;
      const quantity = Math.min(requestedQuantity, cap);
      if (quantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = quantity;
      }
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setErrors([]);

    if (cartLines.length === 0) {
      setErrors(["Agregá al menos un producto al pedido."]);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/rotisserie/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          customerName,
          customerPhone,
          fulfillmentType,
          deliveryAddress: fulfillmentType === "delivery" ? deliveryAddress : undefined,
          paymentMethod,
          notes: notes || undefined,
          items: cartLines.map((line) => ({
            productId: line.product.id,
            quantity: line.quantity,
          })),
        }),
      });

      const data = (await response.json()) as { orderId?: string; message?: string; errors?: string[] };

      if (!response.ok) {
        setErrors(data.errors ?? [data.message ?? "No pudimos crear el pedido."]);
        setSubmitting(false);
        return;
      }

      router.push(`${resolvedOrderBasePath}/order/${data.orderId}`);
    } catch {
      setErrors(["Hubo un problema de conexión. Probá de nuevo."]);
      setSubmitting(false);
    }
  }

  return (
    <div className="tenant-layout">
      <section className="agenda-shell">
        {catalog.map((category) => (
          <article key={category.id} className="panel rotisserie-category-panel">
            <h2 style={{ margin: "0 0 1rem", fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
              {category.name}
            </h2>

            {category.products.length === 0 ? (
              <p className="muted">Sin productos en esta categoría.</p>
            ) : (
              <ul className="service-list rotisserie-product-list">
                {category.products.map((product) => {
                  const quantity = cart[product.id] ?? 0;
                  return (
                    <li key={product.id} className="rotisserie-product-row">
                      <span className="rotisserie-product-info">
                        <strong>{product.name}</strong>
                        {product.description ? (
                          <span className="muted" style={{ fontSize: "0.9rem" }}>
                            {product.description}
                          </span>
                        ) : null}
                      </span>
                      <span className="rotisserie-product-actions">
                        <span className="price">{formatPrice(product.priceInCents)}</span>
                        <span className="rotisserie-quantity-control">
                          <button
                            type="button"
                            className="button-secondary rotisserie-quantity-button"
                            onClick={() => changeQuantity(product.id, -1)}
                            aria-label={`Quitar uno de ${product.name}`}
                            disabled={quantity === 0}
                          >
                            −
                          </button>
                          <span className="rotisserie-quantity-value">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            className="button-secondary rotisserie-quantity-button"
                            onClick={() => changeQuantity(product.id, 1)}
                            aria-label={`Agregar uno de ${product.name}`}
                            disabled={
                              (product.stockQuantity !== undefined && quantity >= product.stockQuantity) ||
                              quantity >= MAX_UNITS_PER_PRODUCT
                            }
                          >
                            +
                          </button>
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </article>
        ))}
      </section>

      <aside className="panel" style={{ padding: "1.6rem", display: "grid", gap: "1.25rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.4rem" }}>Tu pedido</h2>

        {cartLines.length === 0 ? (
          <p className="muted">Todavía no agregaste productos. Tocá “+” en la carta.</p>
        ) : (
          <ul className="service-list">
            {cartLines.map((line) => (
              <li key={line.product.id}>
                <span>
                  {line.quantity}x {line.product.name}
                </span>
                <span className="price">
                  {formatPrice(line.product.priceInCents * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="booking-summary booking-summary--selected">
          <span>Total ({itemCount} {itemCount === 1 ? "ítem" : "ítems"})</span>
          <strong>{formatPrice(totalInCents)}</strong>
          {resolvedDeliveryFeeInCents > 0 ? <span>Incluye envío: {formatPrice(resolvedDeliveryFeeInCents)}</span> : null}
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          <label className="booking-field booking-field--full">
            <span className="muted">Nombre</span>
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              maxLength={120}
              required
            />
          </label>

          <label className="booking-field booking-field--full">
            <span className="muted">Teléfono (WhatsApp)</span>
            <input
              type="tel"
              inputMode="tel"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="Tu celular"
              pattern="^[0-9+()\s-]{8,20}$"
              title="Podés escribirlo como 3454200683, 3454 15 200683 o +5493454200683"
              required
            />
          </label>

          <label className="booking-field">
            <span className="muted">Entrega</span>
            <select
              value={fulfillmentType}
              onChange={(event) => setFulfillmentType(event.target.value as FulfillmentType)}
            >
              <option value="pickup">Retiro en el local</option>
              <option value="delivery">Delivery</option>
            </select>
          </label>

          <label className="booking-field">
            <span className="muted">Pago</span>
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            >
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
            </select>
          </label>

          {fulfillmentType === "delivery" ? (
            <label className="booking-field booking-field--full">
              <span className="muted">Dirección de entrega</span>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                maxLength={200}
                required
              />
            </label>
          ) : null}

          <label className="booking-field booking-field--full">
            <span className="muted">Notas (opcional)</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={300}
              rows={2}
            />
          </label>

          {errors.length > 0 ? (
            <div className="booking-feedback booking-feedback--error booking-field--full">
              <ul className="booking-errors">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="submit"
            className="button booking-submit booking-field--full"
            disabled={submitting || cartLines.length === 0}
          >
            {submitting ? "Enviando pedido..." : "Confirmar pedido"}
          </button>
        </form>
      </aside>
    </div>
  );
}
