import { ConsoleNotificationSender } from "../../../../core/notifications/infra/ConsoleNotificationSender";
import { prisma } from "../../../../core/shared/infra/prisma/prismaClient";
import { CreateOrderService } from "../../application/services/CreateOrderService";
import { CreateOrderController } from "../../interface/http/controllers/CreateOrderController";
import { PrismaOrderRepository } from "../persistence/repositories/PrismaOrderRepository";
import { PrismaProductRepository } from "../persistence/repositories/PrismaProductRepository";

export function buildCreateOrderController(tenantId: string): CreateOrderController {
  // Fase 2: notificación stub por consola. WhatsApp Cloud llega en una fase posterior.
  const notificationSender = new ConsoleNotificationSender();

  const service = new CreateOrderService(
    new PrismaProductRepository(prisma),
    new PrismaOrderRepository(prisma),
    notificationSender,
  );

  return new CreateOrderController(service, tenantId);
}
