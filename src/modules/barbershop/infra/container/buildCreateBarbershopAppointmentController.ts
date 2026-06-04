import { WebhookNotificationSender } from "../../../../core/notifications/infra/WebhookNotificationSender";
import { decrypt } from "../../../../core/crypto/crypto-utils";
import { prisma } from "../../../../core/shared/infra/prisma/prismaClient";
import { CreateBarbershopAppointmentService } from "../../application/services/CreateBarbershopAppointmentService";
import { CreateBarbershopAppointmentController } from "../../interface/http/controllers/CreateBarbershopAppointmentController";
import { PrismaBarbershopCustomerRepository } from "../persistence/repositories/PrismaBarbershopCustomerRepository";
import { PrismaBarbershopAppointmentRepository } from "../persistence/repositories/PrismaBarbershopAppointmentRepository";
import { isWhatsAppConfig } from "../../../integrations/types";

export async function buildCreateBarbershopAppointmentController(
  tenantId: string,
): Promise<CreateBarbershopAppointmentController> {
  const appointmentRepository = new PrismaBarbershopAppointmentRepository(prisma);
  const customerRepository = new PrismaBarbershopCustomerRepository(prisma);

  // Obtener credenciales de WhatsApp de TenantIntegration
  const integration = await prisma.tenantIntegration.findUnique({
    where: {
      tenantId_provider: {
        tenantId,
        provider: "whatsapp",
      },
    },
  });

  let notificationSender: WebhookNotificationSender;

  if (!integration || !isWhatsAppConfig(integration.config)) {
    console.warn(`WhatsApp integration not configured for tenant ${tenantId}. Notifications will be skipped.`);
    notificationSender = new WebhookNotificationSender("", "", "");
  } else {
    const config = integration.config;
    const apiToken = decrypt(config.apiToken.encrypted, config.apiToken.iv, config.apiToken.authTag);
    notificationSender = new WebhookNotificationSender(
      config.phoneNumberId,
      apiToken,
      config.recipientPhone,
    );
  }

  const service = new CreateBarbershopAppointmentService(
    appointmentRepository,
    customerRepository,
    notificationSender,
  );

  return new CreateBarbershopAppointmentController(service);
}