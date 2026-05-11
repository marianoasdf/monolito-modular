import { buildCreateBarbershopAppointmentController } from "../../../../modules/barbershop/infra/container/buildCreateBarbershopAppointmentController";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as {
    tenantId: string;
    customerId?: string;
    customerFullName?: string;
    customerPhoneNumber?: string;
    barberId: string;
    serviceCode: string;
    startsAt: string;
    durationInMinutes: number;
    notes?: string;
  };

  const controller = buildCreateBarbershopAppointmentController();
  const response = await controller.handle(body);

  return Response.json(response.body, { status: response.status });
}