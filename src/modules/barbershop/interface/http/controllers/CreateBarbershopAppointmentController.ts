import { DomainError } from "../../../../../core/shared/domain/DomainError";
import { CreateBarbershopAppointmentService } from "../../../application/services/CreateBarbershopAppointmentService";
import { CreateBarbershopAppointmentHttpRequest } from "../validators/validateCreateBarbershopAppointmentRequest";

interface HttpResponse {
  status: number;
  body: unknown;
}

export class CreateBarbershopAppointmentController {
  constructor(private readonly service: CreateBarbershopAppointmentService) {}

  async handle(body: CreateBarbershopAppointmentHttpRequest): Promise<HttpResponse> {
    try {
      const result = await this.service.execute({
        tenantId: body.tenantId,
        customerId: body.customerId,
        customerFullName: body.customerFullName,
        customerPhoneNumber: body.customerPhoneNumber,
        barberId: body.barberId,
        serviceCode: body.serviceCode,
        serviceName: body.serviceName,
        startsAt: new Date(body.startsAt),
        durationInMinutes: body.durationInMinutes,
        notes: body.notes,
      });

      return {
        status: 201,
        body: result,
      };
    } catch (error) {
      if (error instanceof DomainError) {
        return {
          status: 400,
          body: { message: error.message },
        };
      }

      return {
        status: 500,
        body: { message: "Unexpected error while creating appointment" },
      };
    }
  }
}