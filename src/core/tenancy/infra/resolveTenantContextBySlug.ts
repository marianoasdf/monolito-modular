import { prisma } from "../../shared/infra/prisma/prismaClient";
import { TenantContext } from "../domain/TenantContext";

export async function resolveTenantContextBySlug(
  tenantSlug: string,
): Promise<TenantContext | null> {
  const slug = tenantSlug.trim().toLowerCase();

  if (!slug) {
    return null;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, slug: true },
  });

  if (!tenant) {
    return null;
  }

  return { tenantId: tenant.id, tenantSlug: tenant.slug };
}
