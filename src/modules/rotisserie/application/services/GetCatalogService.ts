import { UseCase } from "../../../../core/shared/application/UseCase";
import { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { GetCatalogQuery } from "../dto/GetCatalogQuery";

export interface CatalogProductView {
  id: string;
  name: string;
  description?: string;
  priceInCents: number;
  stockQuantity?: number;
}

export interface CatalogCategoryView {
  id: string;
  name: string;
  products: CatalogProductView[];
}

export type CatalogView = CatalogCategoryView[];

export class GetCatalogService implements UseCase<GetCatalogQuery, CatalogView> {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(query: GetCatalogQuery): Promise<CatalogView> {
    const [categories, products] = await Promise.all([
      this.categoryRepository.listByTenant(query.tenantId),
      this.productRepository.listByTenant(query.tenantId),
    ]);

    const productsByCategory = new Map<string, CatalogProductView[]>();

    for (const product of products) {
      const props = product.toPrimitives();
      const bucket = productsByCategory.get(props.categoryId) ?? [];
      bucket.push({
        id: props.id,
        name: props.name,
        description: props.description,
        priceInCents: props.priceInCents,
        stockQuantity: props.stockQuantity,
      });
      productsByCategory.set(props.categoryId, bucket);
    }

    return categories.map((category) => {
      const props = category.toPrimitives();
      return {
        id: props.id,
        name: props.name,
        products: productsByCategory.get(props.id) ?? [],
      };
    });
  }
}
