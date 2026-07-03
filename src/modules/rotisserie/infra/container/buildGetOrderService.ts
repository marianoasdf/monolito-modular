import { prisma } from "../../../../core/shared/infra/prisma/prismaClient";
import { GetOrderService } from "../../application/services/GetOrderService";
import { PrismaOrderRepository } from "../persistence/repositories/PrismaOrderRepository";

export function buildGetOrderService(): GetOrderService {
  return new GetOrderService(new PrismaOrderRepository(prisma));
}
