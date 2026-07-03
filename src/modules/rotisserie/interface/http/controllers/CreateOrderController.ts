import { DomainError } from "../../../../../core/shared/domain/DomainError";
import { CreateOrderService } from "../../../application/services/CreateOrderService";
import { CreateOrderHttpRequest } from "../validators/validateCreateOrderRequest";

interface HttpResponse {
  status: number;
  body: unknown;
}

export class CreateOrderController {
  constructor(
    private readonly service: CreateOrderService,
    private readonly tenantId: string,
  ) {}

  async handle(body: CreateOrderHttpRequest): Promise<HttpResponse> {
    try {
      const result = await this.service.execute({
        tenantId: this.tenantId,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        fulfillmentType: body.fulfillmentType,
        deliveryAddress: body.deliveryAddress,
        paymentMethod: body.paymentMethod,
        items: body.items,
        notes: body.notes,
      });

      return { status: 201, body: result };
    } catch (error) {
      if (error instanceof DomainError) {
        return { status: 400, body: { message: error.message } };
      }

      console.error("Unexpected error while creating order:", error);
      return {
        status: 500,
        body: { message: "Unexpected error while creating order" },
      };
    }
  }
}
