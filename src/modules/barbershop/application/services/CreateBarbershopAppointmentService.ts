import { NotificationSender } from "../../../../core/notifications/application/contracts/NotificationSender";
import { DomainError } from "../../../../core/shared/domain/DomainError";
import { UseCase } from "../../../../core/shared/application/UseCase";
import { BarbershopAppointment } from "../../domain/entities/BarbershopAppointment";
import { BarbershopCustomer } from "../../domain/entities/BarbershopCustomer";
import { normalizeBarbershopPhoneNumber } from "../../domain/value-objects/normalizeBarbershopPhoneNumber";
import { BarbershopAppointmentRepository } from "../../domain/repositories/BarbershopAppointmentRepository";
import { BarbershopCustomerRepository } from "../../domain/repositories/BarbershopCustomerRepository";
import { CreateBarbershopAppointmentCommand } from "../dto/CreateBarbershopAppointmentCommand";

export class CreateBarbershopAppointmentService
  implements UseCase<CreateBarbershopAppointmentCommand, { appointmentId: string }>
{
  constructor(
    private readonly appointmentRepository: BarbershopAppointmentRepository,
    private readonly customerRepository: BarbershopCustomerRepository,
    private readonly notificationSender: NotificationSender,
  ) {}

  private async resolveCustomer(
    command: CreateBarbershopAppointmentCommand,
  ): Promise<BarbershopCustomer> {
    if (command.customerId) {
      const customer = await this.customerRepository.findById({
        tenantId: command.tenantId,
        customerId: command.customerId,
      });

      if (!customer) {
        throw new DomainError("Customer was not found for that tenant");
      }

      return customer;
    }

    if (!command.customerFullName || !command.customerPhoneNumber) {
      throw new DomainError("customerFullName and customerPhoneNumber are required");
    }

    const normalizedPhoneNumber = normalizeBarbershopPhoneNumber(command.customerPhoneNumber);

    if (!normalizedPhoneNumber) {
      throw new DomainError("customerPhoneNumber is invalid");
    }

    const existingCustomer = await this.customerRepository.findByPhoneNumber({
      tenantId: command.tenantId,
      phoneNumber: normalizedPhoneNumber,
    });

    if (existingCustomer) {
      return existingCustomer;
    }

    const customer = BarbershopCustomer.create({
      id: crypto.randomUUID(),
      tenantId: command.tenantId,
      fullName: command.customerFullName,
      phoneNumber: normalizedPhoneNumber,
    });

    await this.customerRepository.save(customer);

    return customer;
  }

  async execute(
    command: CreateBarbershopAppointmentCommand,
  ): Promise<{ appointmentId: string }> {
    const customer = await this.resolveCustomer(command);

    const alreadyBooked = await this.appointmentRepository.existsAtSlot({
      tenantId: command.tenantId,
      barberId: command.barberId,
      startsAt: command.startsAt,
    });

    if (alreadyBooked) {
      throw new DomainError("The barber already has an appointment at that time");
    }

    const appointment = BarbershopAppointment.create({
      id: crypto.randomUUID(),
      tenantId: command.tenantId,
      customerId: customer.toPrimitives().id,
      barberId: command.barberId,
      serviceCode: command.serviceCode,
      startsAt: command.startsAt,
      durationInMinutes: command.durationInMinutes,
      status: "scheduled",
      notes: command.notes,
    });

    await this.appointmentRepository.save(appointment);

    await this.notificationSender.send({
      tenantId: command.tenantId,
      recipient: customer.toPrimitives().phoneNumber,
      subject: "Turno confirmado",
      body: `Tu turno fue reservado para ${command.startsAt.toISOString()}`,
    });

    return { appointmentId: appointment.toPrimitives().id };
  }
}