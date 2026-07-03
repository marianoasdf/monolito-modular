import { DomainError } from "../../../../core/shared/domain/DomainError";

export interface OrderItemProps {
  productId: string;
  productName: string;
  unitPriceInCents: number;
  quantity: number;
  lineTotalInCents: number;
}

export interface CreateOrderItemProps {
  productId: string;
  productName: string;
  unitPriceInCents: number;
  quantity: number;
}

export class OrderItem {
  private constructor(private readonly props: OrderItemProps) {}

  static create(props: CreateOrderItemProps): OrderItem {
    if (!props.productId) {
      throw new DomainError("OrderItem productId is required");
    }

    if (!props.productName.trim()) {
      throw new DomainError("OrderItem productName is required");
    }

    if (!Number.isInteger(props.unitPriceInCents) || props.unitPriceInCents < 0) {
      throw new DomainError("OrderItem unitPriceInCents must be a non-negative integer");
    }

    if (!Number.isInteger(props.quantity) || props.quantity < 1) {
      throw new DomainError("OrderItem quantity must be an integer greater than zero");
    }

    return new OrderItem({
      productId: props.productId,
      productName: props.productName,
      unitPriceInCents: props.unitPriceInCents,
      quantity: props.quantity,
      lineTotalInCents: props.unitPriceInCents * props.quantity,
    });
  }

  toPrimitives(): OrderItemProps {
    return this.props;
  }
}
