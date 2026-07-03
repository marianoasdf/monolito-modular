import { Product } from "../entities/Product";

export interface ProductRepository {
  listByTenant(tenantId: string): Promise<Product[]>;
  findManyByIds(input: { tenantId: string; productIds: string[] }): Promise<Product[]>;
}
