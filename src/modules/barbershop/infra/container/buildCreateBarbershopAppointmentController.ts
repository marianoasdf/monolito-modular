import { ConsoleNotificationSender } from "../../../../core/notifications/infra/ConsoleNotificationSender";
import { prisma } from "../../../../core/shared/infra/prisma/prismaClient";
import { CreateBarbershopAppointmentService } from "../../application/services/CreateBarbershopAppointmentService";
import { CreateBarbershopAppointmentController } from "../../interface/http/controllers/CreateBarbershopAppointmentController";
import { PrismaBarbershopCustomerRepository } from "../persistence/repositories/PrismaBarbershopCustomerRepository";
import { PrismaBarbershopAppointmentRepository } from "../persistence/repositories/PrismaBarbershopAppointmentRepository";

export function buildCreateBarbershopAppointmentController(): CreateBarbershopAppointmentController {
  const appointmentRepository = new PrismaBarbershopAppointmentRepository(prisma);
  const customerRepository = new PrismaBarbershopCustomerRepository(prisma);
  const notificationSender = new ConsoleNotificationSender();
  const service = new CreateBarbershopAppointmentService(
    appointmentRepository,
    customerRepository,
    notificationSender,
  );

  return new CreateBarbershopAppointmentController(service);
}