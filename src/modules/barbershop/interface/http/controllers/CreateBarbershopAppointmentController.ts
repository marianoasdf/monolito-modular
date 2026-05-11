import { DomainError } from "../../../../../core/shared/domain/DomainError";
import { CreateBarbershopAppointmentService } from "../../../application/services/CreateBarbershopAppointmentService";

interface HttpRequestBody {
  tenantId: string;
  customerId?: string;
  customerFullName?: string;
  customerPhoneNumber?: string;
  barberId: string;
  serviceCode: string;
  startsAt: string;
  durationInMinutes: number;
  notes?: string;
}

interface HttpResponse {
  status: number;
  body: unknown;
}

export class CreateBarbershopAppointmentController {
  constructor(private readonly service: CreateBarbershopAppointmentService) {}

  async handle(body: HttpRequestBody): Promise<HttpResponse> {
    try {
      const result = await this.service.execute({
        tenantId: body.tenantId,
        customerId: body.customerId,
        customerFullName: body.customerFullName,
        customerPhoneNumber: body.customerPhoneNumber,
        barberId: body.barberId,
        serviceCode: body.serviceCode,
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
        body: { message: "Unexpected error" },
      };
    }
  }
}