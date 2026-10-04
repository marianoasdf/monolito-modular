import { DomainError } from "../../../../../core/shared/domain/DomainError";
import { CreateOrderService } from "../../../application/services/CreateOrderService";
import { CreateOrderHttpRequest } from "../validators/validateCreateOrderRequest";

interface HttpResponse {
  status: number;
  body: unknown;
}

function toCustomerMessage(message: string): string {
  switch (message) {
    case "customerPhone is invalid":
      return "El teléfono no es válido. Usá un celular argentino, por ejemplo 3434671787.";
    case "Each item must reference a product":
    case "One of the selected products is not available":
      return "Uno de los productos ya no está disponible. Actualizá la carta e intentá de nuevo.";
    case "Each item quantity must be an integer greater than zero":
    case "An order must have at least one item":
      return "Agregá al menos un producto.";
    case "deliveryAddress is required for delivery orders":
      return "Para delivery, completá la dirección.";
    case "Order total must be greater than zero":
      return "El total del pedido tiene que ser mayor a cero.";
    default:
      return message;
  }
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
        return { status: 400, body: { message: toCustomerMessage(error.message) } };
      }

      console.error("Unexpected error while creating order:", error);
      return {
        status: 500,
        body: { message: "Unexpected error while creating order" },
      };
    }
  }
}
