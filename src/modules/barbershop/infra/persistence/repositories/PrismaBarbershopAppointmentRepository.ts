import { PrismaClient } from "@prisma/client";
import { BarbershopAppointment } from "../../../domain/entities/BarbershopAppointment";
import { BarbershopAppointmentRepository } from "../../../domain/repositories/BarbershopAppointmentRepository";

export class PrismaBarbershopAppointmentRepository
  implements BarbershopAppointmentRepository
{
  constructor(private readonly prismaClient: PrismaClient) {}

  async existsAtSlot(input: {
    tenantId: string;
    barberId: string;
    startsAt: Date;
  }): Promise<boolean> {
    const appointment = await this.prismaClient.barbershopAppointment.findFirst({
      where: {
        tenantId: input.tenantId,
        barberId: input.barberId,
        startsAt: input.startsAt,
        status: "SCHEDULED",
      },
      select: { id: true },
    });

    return appointment !== null;
  }

  async save(appointment: BarbershopAppointment): Promise<void> {
    const props = appointment.toPrimitives();

    await this.prismaClient.barbershopAppointment.create({
      data: {
        id: props.id,
        tenantId: props.tenantId,
        customerId: props.customerId,
        barberId: props.barberId,
        serviceCode: props.serviceCode,
        startsAt: props.startsAt,
        durationInMinutes: props.durationInMinutes,
        status: props.status.toUpperCase() as "SCHEDULED" | "COMPLETED" | "CANCELLED",
        notes: props.notes,
      },
    });
  }
}