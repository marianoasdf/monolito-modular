export type FulfillmentType = "pickup" | "delivery";
export type PaymentMethod = "cash" | "transfer";
export type OrderStatus = "pending" | "confirmed" | "cancelled";

export const FULFILLMENT_TYPES: readonly FulfillmentType[] = ["pickup", "delivery"];
export const PAYMENT_METHODS: readonly PaymentMethod[] = ["cash", "transfer"];
export const MAX_UNITS_PER_PRODUCT = 50;

export function isFulfillmentType(value: unknown): value is FulfillmentType {
  return value === "pickup" || value === "delivery";
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "cash" || value === "transfer";
}
