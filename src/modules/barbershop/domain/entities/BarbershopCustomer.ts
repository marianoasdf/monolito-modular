import { DomainError } from "../../../../core/shared/domain/DomainError";

export interface BarbershopCustomerProps {
  id: string;
  tenantId: string;
  fullName: string;
  phoneNumber: string;
}

export class BarbershopCustomer {
  constructor(private readonly props: BarbershopCustomerProps) {
    if (!props.tenantId) {
      throw new DomainError("tenantId is required");
    }

    if (!props.fullName.trim()) {
      throw new DomainError("Customer fullName is required");
    }

    if (!props.phoneNumber.trim()) {
      throw new DomainError("Customer phoneNumber is required");
    }
  }

  static create(props: BarbershopCustomerProps): BarbershopCustomer {
    return new BarbershopCustomer(props);
  }

  toPrimitives(): BarbershopCustomerProps {
    return this.props;
  }
}