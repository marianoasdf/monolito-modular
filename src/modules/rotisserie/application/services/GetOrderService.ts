import { UseCase } from "../../../../core/shared/application/UseCase";
import { OrderPrimitives } from "../../domain/entities/Order";
import { OrderRepository } from "../../domain/repositories/OrderRepository";
import { GetOrderQuery } from "../dto/GetOrderQuery";

export class GetOrderService implements UseCase<GetOrderQuery, OrderPrimitives | null> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: GetOrderQuery): Promise<OrderPrimitives | null> {
    const order = await this.orderRepository.findById({
      tenantId: query.tenantId,
      orderId: query.orderId,
    });

    return order ? order.toPrimitives() : null;
  }
}
