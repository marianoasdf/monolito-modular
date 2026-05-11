import { prisma } from "../../../../core/shared/infra/prisma/prismaClient";
import { GetBarbershopSiteProfileService } from "../../application/services/GetBarbershopSiteProfileService";
import { PrismaBarbershopSiteProfileRepository } from "../content/PrismaBarbershopSiteProfileRepository";

export function buildGetBarbershopSiteProfileService(): GetBarbershopSiteProfileService {
  const repository = new PrismaBarbershopSiteProfileRepository(prisma);
  return new GetBarbershopSiteProfileService(repository);
}