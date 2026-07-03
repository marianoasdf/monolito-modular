import { FulfillmentType, PaymentMethod } from "../../domain/value-objects/orderTypes";

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderCommand {
  tenantId: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  items: CreateOrderItemInput[];
  notes?: string;
}
