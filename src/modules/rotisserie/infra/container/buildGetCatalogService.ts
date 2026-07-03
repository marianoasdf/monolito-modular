import { prisma } from "../../../../core/shared/infra/prisma/prismaClient";
import { GetCatalogService } from "../../application/services/GetCatalogService";
import { PrismaCategoryRepository } from "../persistence/repositories/PrismaCategoryRepository";
import { PrismaProductRepository } from "../persistence/repositories/PrismaProductRepository";

export function buildGetCatalogService(): GetCatalogService {
  return new GetCatalogService(
    new PrismaCategoryRepository(prisma),
    new PrismaProductRepository(prisma),
  );
}
