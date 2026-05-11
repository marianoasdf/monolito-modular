import { BarbershopCustomer } from "../entities/BarbershopCustomer";

export interface BarbershopCustomerRepository {
  findById(input: { tenantId: string; customerId: string }): Promise<BarbershopCustomer | null>;
  findByPhoneNumber(input: { tenantId: string; phoneNumber: string }): Promise<BarbershopCustomer | null>;
  save(customer: BarbershopCustomer): Promise<void>;
}