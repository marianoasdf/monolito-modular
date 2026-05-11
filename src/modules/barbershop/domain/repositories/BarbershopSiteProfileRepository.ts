import { BarbershopSiteProfile } from "../entities/BarbershopSiteProfile";

export interface BarbershopSiteProfileRepository {
  findByTenantSlug(tenantSlug: string): Promise<BarbershopSiteProfile | null>;
}