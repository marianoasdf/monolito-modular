import { PrismaClient } from "@prisma/client";
import { Order } from "../../../domain/entities/Order";
import { OrderItem } from "../../../domain/entities/OrderItem";
import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import {
  FulfillmentType,
  PaymentMethod,
} from "../../../domain/value-objects/orderTypes";

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async save(order: Order): Promise<void> {
    const props = order.toPrimitives();

    await this.prismaClient.$transaction(async (tx) => {
      await tx.rotisserieOrder.create({
        data: {
          id: props.id,
          tenantId: props.tenantId,
          customerName: props.customerName,
          customerPhone: props.customerPhone,
          fulfillmentType: props.fulfillmentType,
          deliveryAddress: props.deliveryAddress ?? null,
          paymentMethod: props.paymentMethod,
          status: props.status,
          deliveryFeeInCents: props.deliveryFeeInCents,
          totalInCents: props.totalInCents,
          notes: props.notes ?? null,
          items: {
            create: props.items.map((item) => ({
              tenantId: props.tenantId,
              productId: item.productId,
              productName: item.productName,
              unitPriceInCents: item.unitPriceInCents,
              quantity: item.quantity,
              lineTotalInCents: item.lineTotalInCents,
            })),
          },
        },
      });

      for (const item of props.items) {
        await tx.rotisserieProduct.updateMany({
          where: {
            id: item.productId,
            tenantId: props.tenantId,
            stockQuantity: { gte: item.quantity },
          },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });
      }
    });
  }

  async findById(input: {
    tenantId: string;
    orderId: string;
  }): Promise<Order | null> {
    const row = await this.prismaClient.rotisserieOrder.findFirst({
      where: { id: input.orderId, tenantId: input.tenantId },
      include: { items: true },
    });

    if (!row) {
      return null;
    }

    const items = row.items.map((item) =>
      OrderItem.create({
        productId: item.productId,
        productName: item.productName,
        unitPriceInCents: item.unitPriceInCents,
        quantity: item.quantity,
      }),
    );

    return Order.create({
      id: row.id,
      tenantId: row.tenantId,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      fulfillmentType: row.fulfillmentType as FulfillmentType,
      deliveryAddress: row.deliveryAddress ?? undefined,
      paymentMethod: row.paymentMethod as PaymentMethod,
      items,
      deliveryFeeInCents: row.deliveryFeeInCents,
      notes: row.notes ?? undefined,
    });
  }
}
