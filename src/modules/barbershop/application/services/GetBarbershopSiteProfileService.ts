import { UseCase } from "../../../../core/shared/application/UseCase";
import { BarbershopSiteProfile } from "../../domain/entities/BarbershopSiteProfile";
import { BarbershopSiteProfileRepository } from "../../domain/repositories/BarbershopSiteProfileRepository";
import { GetBarbershopSiteProfileQuery } from "../dto/GetBarbershopSiteProfileQuery";

export class GetBarbershopSiteProfileService
  implements UseCase<GetBarbershopSiteProfileQuery, BarbershopSiteProfile | null>
{
  constructor(private readonly repository: BarbershopSiteProfileRepository) {}

  execute(query: GetBarbershopSiteProfileQuery): Promise<BarbershopSiteProfile | null> {
    return this.repository.findByTenantSlug(query.tenantSlug);
  }
}