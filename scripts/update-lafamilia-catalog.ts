import { Prisma, PrismaClient } from "@prisma/client";

interface CatalogProduct {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly priceInCents: number;
  readonly sortOrder: number;
}

interface CatalogCategory {
  readonly id: string;
  readonly name: string;
  readonly sortOrder: number;
  readonly products: readonly CatalogProduct[];
}

const { rotisserieCatalog } = require("../prisma/seed.js") as {
  rotisserieCatalog: readonly CatalogCategory[];
};

const prisma = new PrismaClient();

function normalizeCatalogName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

async function updateCatalog(
  tx: Prisma.TransactionClient,
  tenantId: string,
  catalog: readonly CatalogCategory[],
): Promise<void> {
  const categoryIds = catalog.map(({ id }) => id);
  const productIds = catalog.flatMap(({ products }) => products.map(({ id }) => id));

  await tx.rotisserieProduct.deleteMany({
    where: { tenantId, id: { notIn: productIds } },
  });
  await tx.rotisserieCategory.deleteMany({
    where: { tenantId, id: { notIn: categoryIds } },
  });

  for (const category of catalog) {
    const existingCategory = await tx.rotisserieCategory.findUnique({
      where: { id: category.id },
      select: { tenantId: true },
    });
    if (existingCategory && existingCategory.tenantId !== tenantId) {
      throw new Error(`La categoría ${category.id} pertenece a otro tenant.`);
    }

    await tx.rotisserieCategory.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        normalizedName: normalizeCatalogName(category.name),
        sortOrder: category.sortOrder,
      },
      create: {
        id: category.id,
        tenantId,
        name: category.name,
        normalizedName: normalizeCatalogName(category.name),
        sortOrder: category.sortOrder,
      },
    });

    for (const product of category.products) {
      const existingProduct = await tx.rotisserieProduct.findUnique({
        where: { id: product.id },
        select: { tenantId: true },
      });
      if (existingProduct && existingProduct.tenantId !== tenantId) {
        throw new Error(`El producto ${product.id} pertenece a otro tenant.`);
      }

      await tx.rotisserieProduct.upsert({
        where: { id: product.id },
        update: {
          categoryId: category.id,
          name: product.name,
          normalizedName: normalizeCatalogName(product.name),
          description: product.description ?? null,
          priceInCents: product.priceInCents,
          sortOrder: product.sortOrder,
        },
        create: {
          id: product.id,
          tenantId,
          categoryId: category.id,
          name: product.name,
          normalizedName: normalizeCatalogName(product.name),
          description: product.description ?? null,
          priceInCents: product.priceInCents,
          sortOrder: product.sortOrder,
        },
      });
    }
  }

  await tx.rotisserieTenantSettings.upsert({
    where: { tenantId },
    update: {},
    create: { tenantId, weeklyMenu: {} },
  });
}

async function updateLaFamiliaCatalog(): Promise<void> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: "lafamilia" },
    select: { id: true, name: true },
  });

  if (!tenant) {
    throw new Error("No existe el tenant 'lafamilia'. Ejecutá primero npm run prisma:seed.");
  }

  await prisma.$transaction((tx) => updateCatalog(tx, tenant.id, rotisserieCatalog), {
    maxWait: 15_000,
    timeout: 120_000,
  });

  const productCount = rotisserieCatalog.reduce(
    (total, category) => total + category.products.length,
    0,
  );
  console.log(
    `Carta de ${tenant.name} actualizada: ${rotisserieCatalog.length} categorías y ${productCount} productos.`,
  );
}

updateLaFamiliaCatalog()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
