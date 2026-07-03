import { PrismaClient } from "@prisma/client";
import { Category } from "../../../domain/entities/Category";
import { CategoryRepository } from "../../../domain/repositories/CategoryRepository";

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async listByTenant(tenantId: string): Promise<Category[]> {
    const rows = await this.prismaClient.rotisserieCategory.findMany({
      where: { tenantId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return rows.map((row) =>
      Category.create({
        id: row.id,
        tenantId: row.tenantId,
        name: row.name,
        sortOrder: row.sortOrder,
      }),
    );
  }
}
