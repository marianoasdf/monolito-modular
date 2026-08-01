import { InMemoryRateLimiter } from "../../../../core/shared/infra/http/InMemoryRateLimiter";
import { resolveTenantContextBySlug } from "../../../../core/tenancy/infra/resolveTenantContextBySlug";
import { buildCreateOrderController } from "../../../../modules/rotisserie/infra/container/buildCreateOrderController";
import { validateCreateOrderRequest } from "../../../../modules/rotisserie/interface/http/validators/validateCreateOrderRequest";

const createOrderRateLimiter = new InMemoryRateLimiter(10, 60_000);

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request): Promise<Response> {
  const clientIp = getClientIp(request);
  const rateLimit = createOrderRateLimiter.consume(clientIp);

  if (!rateLimit.allowed) {
    return Response.json(
      { message: "Too many order requests. Please try again later." },
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
      { message: "Content-Type must be application/json" },
      { status: 415 },
    );
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ message: "Request body must be valid JSON" }, { status: 400 });
  }

  // El tenant se resuelve server-side desde el slug; nunca se confía el tenantId del cliente.
  const tenantSlug =
    rawBody && typeof rawBody === "object"
      ? (rawBody as { tenantSlug?: unknown }).tenantSlug
      : undefined;

  if (typeof tenantSlug !== "string" || !tenantSlug.trim()) {
    return Response.json({ message: "tenantSlug is required" }, { status: 400 });
  }

  const tenant = await resolveTenantContextBySlug(tenantSlug);

  if (!tenant) {
    return Response.json({ message: "Unknown tenant" }, { status: 404 });
  }

  const validation = validateCreateOrderRequest(rawBody);

  if (!validation.success) {
    return Response.json(
      { message: "Invalid order payload", errors: validation.errors },
      { status: 400 },
    );
  }

  const controller = await buildCreateOrderController(tenant.tenantId);
  const response = await controller.handle(validation.data);

  return Response.json(response.body, {
    status: response.status,
    headers: { "X-RateLimit-Remaining": String(rateLimit.remaining) },
  });
}
