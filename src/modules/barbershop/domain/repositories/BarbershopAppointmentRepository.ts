import { BarbershopAppointment } from "../entities/BarbershopAppointment";

export interface BarbershopAppointmentRepository {
  existsAtSlot(input: {
    tenantId: string;
    barberId: string;
    startsAt: Date;
  }): Promise<boolean>;
  save(appointment: BarbershopAppointment): Promise<void>;
}