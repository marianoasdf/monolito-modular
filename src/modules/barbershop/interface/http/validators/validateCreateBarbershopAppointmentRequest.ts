import { BarbershopAppointmentPaymentMethod } from "../../../domain/entities/BarbershopAppointment";
import { normalizeBarbershopPhoneNumber } from "../../../domain/value-objects/normalizeBarbershopPhoneNumber";

export interface CreateBarbershopAppointmentHttpRequest {
  tenantId: string;
  customerId?: string;
  customerFullName?: string;
  customerPhoneNumber?: string;
  barberId: string;
  serviceCode: string;
  serviceName?: string;
  startsAt: string;
  durationInMinutes: number;
  priceInArs: number;
  paymentMethod: BarbershopAppointmentPaymentMethod;
  notes?: string;
}

interface ValidationSuccess {
  success: true;
  data: CreateBarbershopAppointmentHttpRequest;
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

function isPaymentMethod(value: unknown): value is BarbershopAppointmentPaymentMethod {
  return value === "cash" || value === "mercadopago";
}

export function validateCreateBarbershopAppointmentRequest(
  value: unknown,
): ValidationResult {
  if (!isRecord(value)) {
    return {
      success: false,
      errors: ["Request body must be a JSON object"],
    };
  }

  const tenantId = readOptionalTrimmedString(value.tenantId);
  const customerId = readOptionalTrimmedString(value.customerId);
  const customerFullName = readOptionalTrimmedString(value.customerFullName);
  const rawCustomerPhoneNumber = readOptionalTrimmedString(value.customerPhoneNumber);
  const barberId = readOptionalTrimmedString(value.barberId);
  const serviceCode = readOptionalTrimmedString(value.serviceCode);
  const serviceName = readOptionalTrimmedString(value.serviceName);
  const startsAt = readOptionalTrimmedString(value.startsAt);
  const notes = readOptionalTrimmedString(value.notes);
  const paymentMethod = value.paymentMethod ?? "cash";
  const errors: string[] = [];

  const durationInMinutes =
    typeof value.durationInMinutes === "number" ? value.durationInMinutes : Number.NaN;
  const priceInArs = typeof value.priceInArs === "number" ? value.priceInArs : Number.NaN;

  if (!tenantId || tenantId.length > 80) {
    errors.push("tenantId is required and must be at most 80 characters");
  }

  if (!barberId || barberId.length > 80) {
    errors.push("barberId is required and must be at most 80 characters");
  }

  if (!serviceCode || serviceCode.length > 80) {
    errors.push("serviceCode is required and must be at most 80 characters");
  }

  if (serviceName && serviceName.length > 120) {
    errors.push("serviceName must be at most 120 characters");
  }

  if (!startsAt) {
    errors.push("startsAt is required");
  } else {
    const parsedDate = new Date(startsAt);
    if (Number.isNaN(parsedDate.getTime())) {
      errors.push("startsAt must be a valid ISO date string");
    }
  }

  if (!Number.isInteger(durationInMinutes) || durationInMinutes < 15 || durationInMinutes > 240) {
    errors.push("durationInMinutes must be an integer between 15 and 240");
  }

  if (!Number.isFinite(priceInArs) || priceInArs <= 0) {
    errors.push("priceInArs must be a number greater than zero");
  }

  if (!isPaymentMethod(paymentMethod)) {
    errors.push("paymentMethod must be 'cash' or 'mercadopago'");
  }

  if (notes && notes.length > 300) {
    errors.push("notes must be at most 300 characters");
  }

  let customerPhoneNumber: string | undefined;

  if (customerId) {
    if (customerId.length > 80) {
      errors.push("customerId must be at most 80 characters");
    }
  } else {
    if (!customerFullName || customerFullName.length > 120) {
      errors.push("customerFullName is required and must be at most 120 characters");
    }

    if (!rawCustomerPhoneNumber) {
      errors.push("customerPhoneNumber is required when customerId is not provided");
    } else {
      const normalizedPhoneNumber = normalizeBarbershopPhoneNumber(rawCustomerPhoneNumber);

      if (!normalizedPhoneNumber) {
        errors.push(
          "customerPhoneNumber must be a valid mobile number. Ejemplos: 3454200683, 3454 15 200683 o +5493454200683",
        );
      } else {
        customerPhoneNumber = normalizedPhoneNumber;
      }
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: {
      tenantId: tenantId!,
      customerId,
      customerFullName,
      customerPhoneNumber: customerPhoneNumber ?? rawCustomerPhoneNumber,
      barberId: barberId!,
      serviceCode: serviceCode!,
      serviceName,
      startsAt: startsAt!,
      durationInMinutes,
      priceInArs,
      paymentMethod: paymentMethod as BarbershopAppointmentPaymentMethod,
      notes,
    },
  };
}