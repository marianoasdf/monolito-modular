export interface CreateBarbershopAppointmentCommand {
  tenantId: string;
  customerId?: string;
  customerFullName?: string;
  customerPhoneNumber?: string;
  barberId: string;
  serviceCode: string;
  startsAt: Date;
  durationInMinutes: number;
  notes?: string;
}