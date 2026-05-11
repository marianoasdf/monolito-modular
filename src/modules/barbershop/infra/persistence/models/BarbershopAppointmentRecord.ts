export interface BarbershopAppointmentRecord {
  id: string;
  tenantId: string;
  customerId: string;
  barberId: string;
  serviceCode: string;
  startsAt: Date;
  durationInMinutes: number;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  createdAt: Date;
}