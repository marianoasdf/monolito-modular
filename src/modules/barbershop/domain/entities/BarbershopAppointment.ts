import { DomainError } from "../../../../core/shared/domain/DomainError";

export interface BarbershopAppointmentProps {
  id: string;
  tenantId: string;
  customerId: string;
  barberId: string;
  serviceCode: string;
  startsAt: Date;
  durationInMinutes: number;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

export class BarbershopAppointment {
  constructor(private readonly props: BarbershopAppointmentProps) {
    if (!props.tenantId) {
      throw new DomainError("tenantId is required");
    }

    if (props.startsAt.getTime() <= Date.now()) {
      throw new DomainError("Appointment must be scheduled in the future");
    }

    if (props.durationInMinutes <= 0) {
      throw new DomainError("Appointment duration must be greater than zero");
    }
  }

  static create(props: BarbershopAppointmentProps): BarbershopAppointment {
    return new BarbershopAppointment(props);
  }

  toPrimitives(): BarbershopAppointmentProps {
    return this.props;
  }
}