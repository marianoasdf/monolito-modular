import { Category } from "../entities/Category";

export interface CategoryRepository {
  listByTenant(tenantId: string): Promise<Category[]>;
}
