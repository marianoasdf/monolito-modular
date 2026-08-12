import { BarbershopAppointmentPaymentMethod } from "../../domain/entities/BarbershopAppointment";

export interface CreateBarbershopAppointmentCommand {
  tenantId: string;
  customerId?: string;
  customerFullName?: string;
  customerPhoneNumber?: string;
  barberId: string;
  serviceCode: string;
  serviceName?: string;
  startsAt: Date;
  durationInMinutes: number;
  priceInArs: number;
  paymentMethod: BarbershopAppointmentPaymentMethod;
  notes?: string;
}