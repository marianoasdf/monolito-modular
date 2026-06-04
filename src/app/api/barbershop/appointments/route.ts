import { InMemoryRateLimiter } from "../../../../core/shared/infra/http/InMemoryRateLimiter";
import { buildCreateBarbershopAppointmentController } from "../../../../modules/barbershop/infra/container/buildCreateBarbershopAppointmentController";
import {
  validateCreateBarbershopAppointmentRequest,
} from "../../../../modules/barbershop/interface/http/validators/validateCreateBarbershopAppointmentRequest";

const createAppointmentRateLimiter = new InMemoryRateLimiter(10, 60_000);

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request): Promise<Response> {
  const clientIp = getClientIp(request);
  const rateLimit = createAppointmentRateLimiter.consume(clientIp);

  if (!rateLimit.allowed) {
    return Response.json(
      {
        message: "Too many appointment requests. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      },
    );
  }

  const contentType = request.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return Response.json(
      {
        message: "Content-Type must be application/json",
      },
      { status: 415 },
    );
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return Response.json(
      {
        message: "Request body must be valid JSON",
      },
      { status: 400 },
    );
  }

  const validation = validateCreateBarbershopAppointmentRequest(rawBody);

  if (!validation.success) {
    return Response.json(
      {
        message: "Invalid appointment payload",
        errors: validation.errors,
      },
      { status: 400 },
    );
  }

  const controller = await buildCreateBarbershopAppointmentController(validation.data.tenantId);
  const response = await controller.handle(validation.data);

  return Response.json(response.body, {
    status: response.status,
    headers: {
      "X-RateLimit-Remaining": String(rateLimit.remaining),
    },
  });
}