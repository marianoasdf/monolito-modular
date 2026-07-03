import {
  FulfillmentType,
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
    errors.push("customerName is required and must be at most 120 characters");
  }

  if (!customerPhone || customerPhone.length > 40) {
    errors.push("customerPhone is required and must be at most 40 characters");
  }

  if (!isFulfillmentType(fulfillmentType)) {
    errors.push("fulfillmentType must be 'pickup' or 'delivery'");
  }

  if (fulfillmentType === "delivery" && (!deliveryAddress || deliveryAddress.length > 200)) {
    errors.push("deliveryAddress is required for delivery and must be at most 200 characters");
  }

  if (!isPaymentMethod(paymentMethod)) {
    errors.push("paymentMethod must be 'cash' or 'transfer'");
  }

  if (notes && notes.length > 400) {
    errors.push("notes must be at most 400 characters");
  }

  const items: CreateOrderHttpItem[] = [];

  if (!Array.isArray(value.items) || value.items.length === 0) {
    errors.push("items must be a non-empty array");
  } else if (value.items.length > 100) {
    errors.push("items must contain at most 100 entries");
  } else {
    for (const rawItem of value.items) {
      if (!isRecord(rawItem)) {
        errors.push("each item must be an object");
        break;
      }

      const productId = readOptionalTrimmedString(rawItem.productId);
      const quantity =
        typeof rawItem.quantity === "number" ? rawItem.quantity : Number.NaN;

      if (!productId || productId.length > 80) {
        errors.push("each item requires a valid productId");
        break;
      }

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        errors.push("each item quantity must be an integer between 1 and 50");
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
