import { normalizeArgentinePhoneNumber } from "../../../domain/value-objects/normalizeArgentinePhoneNumber";
import {
  FulfillmentType,
  MAX_UNITS_PER_PRODUCT,
  PaymentMethod,
  isFulfillmentType,
  isPaymentMethod,
} from "../../../domain/value-objects/orderTypes";

export interface CreateOrderHttpItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderHttpRequest {
  customerName: string;
  customerPhone: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  items: CreateOrderHttpItem[];
  notes?: string;
}

interface ValidationSuccess {
  success: true;
  data: CreateOrderHttpRequest;
}

interface ValidationFailure {
  success: false;
  errors: string[];
}

type ValidationResult = ValidationSuccess | ValidationFailure;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readQuantity(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    return Number(value);
  }

  return Number.NaN;
}

function readOptionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function validateCreateOrderRequest(value: unknown): ValidationResult {
  if (!isRecord(value)) {
    return { success: false, errors: ["Request body must be a JSON object"] };
  }

  const errors: string[] = [];

  const customerName = readOptionalTrimmedString(value.customerName);
  const customerPhone = readOptionalTrimmedString(value.customerPhone);
  const deliveryAddress = readOptionalTrimmedString(value.deliveryAddress);
  const notes = readOptionalTrimmedString(value.notes);
  const fulfillmentType = value.fulfillmentType;
  const paymentMethod = value.paymentMethod;

  if (!customerName || customerName.length > 120) {
    errors.push("El nombre es obligatorio y puede tener hasta 120 caracteres.");
  }

  if (!customerPhone) {
    errors.push("El teléfono es obligatorio.");
  } else if (!normalizeArgentinePhoneNumber(customerPhone)) {
    errors.push("El teléfono no es válido. Usá un celular argentino, por ejemplo 3454200683.");
  }

  if (!isFulfillmentType(fulfillmentType)) {
    errors.push("Elegí retiro o delivery.");
  }

  if (fulfillmentType === "delivery" && (!deliveryAddress || deliveryAddress.length > 200)) {
    errors.push("Para delivery, la dirección es obligatoria y puede tener hasta 200 caracteres.");
  }

  if (!isPaymentMethod(paymentMethod)) {
    errors.push("Elegí efectivo o transferencia.");
  }

  if (notes && notes.length > 300) {
    errors.push("La nota puede tener hasta 300 caracteres.");
  }

  const items: CreateOrderHttpItem[] = [];

  if (!Array.isArray(value.items) || value.items.length === 0) {
    errors.push("Agregá al menos un producto.");
  } else if (value.items.length > 100) {
    errors.push("El pedido puede tener hasta 100 productos distintos.");
  } else {
    for (const rawItem of value.items) {
      if (!isRecord(rawItem)) {
        errors.push("Hay un producto inválido en el pedido.");
        break;
      }

      const productId = readOptionalTrimmedString(rawItem.productId);
      const quantity = readQuantity(rawItem.quantity);

      if (!productId || productId.length > 80) {
        errors.push("Falta identificar un producto del pedido.");
        break;
      }

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_UNITS_PER_PRODUCT) {
        errors.push(`Podés pedir hasta ${MAX_UNITS_PER_PRODUCT} unidades de cada producto.`);
        break;
      }

      items.push({ productId, quantity });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      customerName: customerName!,
      customerPhone: customerPhone!,
      fulfillmentType: fulfillmentType as FulfillmentType,
      deliveryAddress,
      paymentMethod: paymentMethod as PaymentMethod,
      items,
      notes,
    },
  };
}
