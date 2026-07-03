import { DomainError } from "../../../../core/shared/domain/DomainError";
import { FulfillmentType, OrderStatus, PaymentMethod } from "../value-objects/orderTypes";
import { OrderItem, OrderItemProps } from "./OrderItem";

export interface OrderProps {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  items: OrderItem[];
  totalInCents: number;
  notes?: string;
}

export interface CreateOrderProps {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  notes?: string;
}

export interface OrderPrimitives {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  items: OrderItemProps[];
  totalInCents: number;
  notes?: string;
}

export class Order {
  private constructor(private readonly props: OrderProps) {}

  static create(props: CreateOrderProps): Order {
    if (!props.tenantId) {
      throw new DomainError("tenantId is required");
    }

    if (!props.customerName.trim()) {
      throw new DomainError("customerName is required");
    }

    if (!props.customerPhone.trim()) {
      throw new DomainError("customerPhone is required");
    }

    if (props.items.length === 0) {
      throw new DomainError("An order must have at least one item");
    }

    if (props.fulfillmentType === "delivery" && !props.deliveryAddress?.trim()) {
      throw new DomainError("deliveryAddress is required for delivery orders");
    }

    const totalInCents = props.items.reduce(
      (sum, item) => sum + item.toPrimitives().lineTotalInCents,
      0,
    );

    if (totalInCents <= 0) {
      throw new DomainError("Order total must be greater than zero");
    }

    return new Order({
      id: props.id,
      tenantId: props.tenantId,
      customerName: props.customerName.trim(),
      customerPhone: props.customerPhone.trim(),
      fulfillmentType: props.fulfillmentType,
      deliveryAddress: props.deliveryAddress?.trim() || undefined,
      paymentMethod: props.paymentMethod,
      status: "pending",
      items: props.items,
      totalInCents,
      notes: props.notes?.trim() || undefined,
    });
  }

  toPrimitives(): OrderPrimitives {
    return {
      id: this.props.id,
      tenantId: this.props.tenantId,
      customerName: this.props.customerName,
      customerPhone: this.props.customerPhone,
      fulfillmentType: this.props.fulfillmentType,
      deliveryAddress: this.props.deliveryAddress,
      paymentMethod: this.props.paymentMethod,
      status: this.props.status,
      items: this.props.items.map((item) => item.toPrimitives()),
      totalInCents: this.props.totalInCents,
      notes: this.props.notes,
    };
  }
}
