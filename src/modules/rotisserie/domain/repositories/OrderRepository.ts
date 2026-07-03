import { Order } from "../entities/Order";

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(input: { tenantId: string; orderId: string }): Promise<Order | null>;
}
