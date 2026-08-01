import { ConsoleNotificationSender } from "../../../../core/notifications/infra/ConsoleNotificationSender";
import { RotisserieOrderNotificationSender } from "../../../../core/notifications/infra/RotisserieOrderNotificationSender";
import { decrypt } from "../../../../core/crypto/crypto-utils";
import { prisma } from "../../../../core/shared/infra/prisma/prismaClient";
import { isWhatsAppConfig, resolveRecipientPhones } from "../../../integrations/types";
import { CreateOrderService } from "../../application/services/CreateOrderService";
import { CreateOrderController } from "../../interface/http/controllers/CreateOrderController";
import { PrismaOrderRepository } from "../persistence/repositories/PrismaOrderRepository";
import { PrismaProductRepository } from "../persistence/repositories/PrismaProductRepository";
import { NotificationSender } from "../../../../core/notifications/application/contracts/NotificationSender";

export async function buildCreateOrderController(tenantId: string): Promise<CreateOrderController> {
  const integration = await prisma.tenantIntegration.findUnique({
    where: {
      tenantId_provider: {
        tenantId,
        provider: "whatsapp",
      },
    },
  });

  let notificationSender: NotificationSender;

  if (!integration || !isWhatsAppConfig(integration.config)) {
    console.warn(`WhatsApp integration not configured for tenant ${tenantId}. Using console sender.`);
    notificationSender = new ConsoleNotificationSender();
  } else {
    const config = integration.config;
    const apiToken = decrypt(config.apiToken.encrypted, config.apiToken.iv, config.apiToken.authTag);
    notificationSender = new RotisserieOrderNotificationSender(
      config.phoneNumberId,
      apiToken,
      resolveRecipientPhones(config),
    );
  }

  const service = new CreateOrderService(
    new PrismaProductRepository(prisma),
    new PrismaOrderRepository(prisma),
    notificationSender,
  );

  return new CreateOrderController(service, tenantId);
}
