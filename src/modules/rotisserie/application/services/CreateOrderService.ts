import { NotificationSender } from "../../../../core/notifications/application/contracts/NotificationSender";
import { DomainError } from "../../../../core/shared/domain/DomainError";
import { UseCase } from "../../../../core/shared/application/UseCase";
import { Order } from "../../domain/entities/Order";
import { OrderItem } from "../../domain/entities/OrderItem";
import { OrderRepository } from "../../domain/repositories/OrderRepository";
import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { normalizeArgentinePhoneNumber } from "../../domain/value-objects/normalizeArgentinePhoneNumber";
import { CreateOrderCommand } from "../dto/CreateOrderCommand";

function formatArs(totalInCents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalInCents / 100);
}

export class CreateOrderService implements UseCase<CreateOrderCommand, { orderId: string }> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly orderRepository: OrderRepository,
    private readonly notificationSender: NotificationSender,
  ) {}

  private aggregateQuantities(command: CreateOrderCommand): Map<string, number> {
    const quantities = new Map<string, number>();

    for (const item of command.items) {
      if (!item.productId) {
        throw new DomainError("Each item must reference a product");
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new DomainError("Each item quantity must be an integer greater than zero");
      }

      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }

    if (quantities.size === 0) {
      throw new DomainError("An order must have at least one item");
    }

    return quantities;
  }

  async execute(command: CreateOrderCommand): Promise<{ orderId: string }> {
    const normalizedPhone = normalizeArgentinePhoneNumber(command.customerPhone);

    if (!normalizedPhone) {
      throw new DomainError("customerPhone is invalid");
    }

    const quantities = this.aggregateQuantities(command);

    const products = await this.productRepository.findManyByIds({
      tenantId: command.tenantId,
      productIds: [...quantities.keys()],
    });

    const productsById = new Map(products.map((product) => [product.toPrimitives().id, product]));

    const items = [...quantities.entries()].map(([productId, quantity]) => {
      const product = productsById.get(productId);

      if (!product) {
        throw new DomainError("One of the selected products is not available");
      }

      const productProps = product.toPrimitives();

      return OrderItem.create({
        productId: productProps.id,
        productName: productProps.name,
        unitPriceInCents: productProps.priceInCents,
        quantity,
      });
    });

    const order = Order.create({
      id: crypto.randomUUID(),
      tenantId: command.tenantId,
      customerName: command.customerName,
      customerPhone: normalizedPhone,
      fulfillmentType: command.fulfillmentType,
      deliveryAddress: command.deliveryAddress,
      paymentMethod: command.paymentMethod,
      items,
      notes: command.notes,
    });

    await this.orderRepository.save(order);

    const orderProps = order.toPrimitives();

    try {
      const itemsSummary = orderProps.items
        .map((item) => `${item.quantity}x ${item.productName}`)
        .join(", ");

      await this.notificationSender.send({
        tenantId: command.tenantId,
        recipient: orderProps.customerPhone,
        subject: "Nuevo pedido",
        body:
          `Pedido de ${orderProps.customerName} (${orderProps.customerPhone}). ` +
          `${orderProps.fulfillmentType === "delivery" ? "Delivery" : "Retiro"} · ` +
          `Pago: ${orderProps.paymentMethod === "cash" ? "efectivo" : "transferencia"}. ` +
          `Items: ${itemsSummary}. Total: ${formatArs(orderProps.totalInCents)}.`,
        metadata: {
          customerName: orderProps.customerName,
          customerPhoneNumber: orderProps.customerPhone,
          notes: orderProps.notes,
        },
      });
    } catch (error) {
      console.error("Failed to send order notification", error);
    }

    return { orderId: orderProps.id };
  }
}
