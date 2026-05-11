export interface CreateBarbershopAppointmentHttpRequest {
  tenantId: string;
  customerId?: string;
  customerFullName?: string;
  customerPhoneNumber?: string;
  barberId: string;
  serviceCode: string;
  startsAt: string;
  durationInMinutes: number;
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
  const customerPhoneNumber = readOptionalTrimmedString(value.customerPhoneNumber);
  const barberId = readOptionalTrimmedString(value.barberId);
  const serviceCode = readOptionalTrimmedString(value.serviceCode);
  const startsAt = readOptionalTrimmedString(value.startsAt);
  const notes = readOptionalTrimmedString(value.notes);
  const errors: string[] = [];

  const durationInMinutes =
    typeof value.durationInMinutes === "number" ? value.durationInMinutes : Number.NaN;

  if (!tenantId || tenantId.length > 80) {
    errors.push("tenantId is required and must be at most 80 characters");
  }

  if (!barberId || barberId.length > 80) {
    errors.push("barberId is required and must be at most 80 characters");
  }

  if (!serviceCode || serviceCode.length > 80) {
    errors.push("serviceCode is required and must be at most 80 characters");
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

  if (notes && notes.length > 300) {
    errors.push("notes must be at most 300 characters");
  }

  if (customerId) {
    if (customerId.length > 80) {
      errors.push("customerId must be at most 80 characters");
    }
  } else {
    if (!customerFullName || customerFullName.length > 120) {
      errors.push("customerFullName is required and must be at most 120 characters");
    }

    if (!customerPhoneNumber) {
      errors.push("customerPhoneNumber is required when customerId is not provided");
    } else if (!/^\+?[0-9]{8,15}$/.test(customerPhoneNumber)) {
      errors.push("customerPhoneNumber must contain between 8 and 15 digits and may start with +");
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
      customerPhoneNumber,
      barberId: barberId!,
      serviceCode: serviceCode!,
      startsAt: startsAt!,
      durationInMinutes,
      notes,
    },
  };
}