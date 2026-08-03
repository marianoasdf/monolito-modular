import { PrismaClient } from "@prisma/client";
import { Product } from "../../../domain/entities/Product";
import { ProductRepository } from "../../../domain/repositories/ProductRepository";

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  private toEntity(row: {
    id: string;
    tenantId: string;
    categoryId: string;
    name: string;
    description: string | null;
    priceInCents: number;
    stockQuantity: number | null;
    isAvailable: boolean;
    sortOrder: number;
  }): Product {
    return Product.create({
      id: row.id,
      tenantId: row.tenantId,
      categoryId: row.categoryId,
      name: row.name,
      description: row.description ?? undefined,
      priceInCents: row.priceInCents,
      stockQuantity: row.stockQuantity ?? undefined,
      isAvailable: row.isAvailable,
      sortOrder: row.sortOrder,
    });
  }

  async listByTenant(tenantId: string): Promise<Product[]> {
    const rows = await this.prismaClient.rotisserieProduct.findMany({
      where: {
        tenantId,
        isAvailable: true,
        OR: [{ stockQuantity: null }, { stockQuantity: { gt: 0 } }],
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return rows.map((row) => this.toEntity(row));
  }

  async findManyByIds(input: {
    tenantId: string;
    productIds: string[];
  }): Promise<Product[]> {
    if (input.productIds.length === 0) {
      return [];
    }

    const rows = await this.prismaClient.rotisserieProduct.findMany({
      where: {
        tenantId: input.tenantId,
        id: { in: input.productIds },
        isAvailable: true,
        OR: [{ stockQuantity: null }, { stockQuantity: { gt: 0 } }],
      },
    });

    return rows.map((row) => this.toEntity(row));
  }
}
