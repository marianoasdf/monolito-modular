import { DomainError } from "../../../../core/shared/domain/DomainError";

export interface CategoryProps {
  id: string;
  tenantId: string;
  name: string;
  sortOrder: number;
  isAvailable: boolean;
}

export class Category {
  constructor(private readonly props: CategoryProps) {
    if (!props.tenantId) {
      throw new DomainError("tenantId is required");
    }

    if (!props.name.trim()) {
      throw new DomainError("Category name is required");
    }
  }

  static create(props: CategoryProps): Category {
    return new Category(props);
  }

  toPrimitives(): CategoryProps {
    return this.props;
  }
}
