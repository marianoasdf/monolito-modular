import { DomainError } from "../../../../core/shared/domain/DomainError";

export interface ProductProps {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  description?: string;
  priceInCents: number;
  stockQuantity?: number;
  isAvailable: boolean;
  sortOrder: number;
}

export class Product {
  constructor(private readonly props: ProductProps) {
    if (!props.tenantId) {
      throw new DomainError("tenantId is required");
    }

    if (!props.categoryId) {
      throw new DomainError("categoryId is required");
    }

    if (!props.name.trim()) {
      throw new DomainError("Product name is required");
    }

    if (!Number.isInteger(props.priceInCents) || props.priceInCents < 0) {
      throw new DomainError("Product priceInCents must be a non-negative integer");
    }

    if (props.stockQuantity !== undefined && (!Number.isInteger(props.stockQuantity) || props.stockQuantity < 0)) {
      throw new DomainError("Product stockQuantity must be a non-negative integer");
    }
  }

  static create(props: ProductProps): Product {
    return new Product(props);
  }

  toPrimitives(): ProductProps {
    return this.props;
  }
}
