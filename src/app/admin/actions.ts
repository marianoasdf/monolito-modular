"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../core/shared/infra/prisma/prismaClient";
import { normalizeBarbershopPhoneNumber } from "../../modules/barbershop/domain/value-objects/normalizeBarbershopPhoneNumber";
import {
  createDefaultWeeklySchedule,
  parseTimeList,
  WEEKDAY_FIELDS,
} from "../../modules/barbershop/infra/settings/barbershopTenantSettings";
import {
  createEmptyWeeklyMenu,
  resolveWeeklyMenu,
  rotisserieSettingsSelect,
  tenantUsesWeeklyMenu,
  WEEKLY_MENU_DAYS,
} from "../../modules/rotisserie/infra/settings/rotisserieWeeklyMenu";
import {
  clearAdminAuthenticated,
  isAdminAuthenticated,
  setAdminAuthenticated,
  validateAdminPassword,
} from "./auth";

function resolveBasePath(formData: FormData): string {
  const raw = `${formData.get("basePath") || ""}`.trim();

  // Evita open redirects: solo rutas internas absolutas.
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }

  return "/admin";
}

function resolveTenantSlug(formData: FormData): string {
  const raw = `${formData.get("tenantSlug") || ""}`.trim();
  return raw || "mgbarber";
}

function parseOptionalNonNegativeInt(value: FormDataEntryValue | null): number | null {
  const raw = `${value || ""}`.trim();
  if (!raw) {
    return null;
  }
  if (!/^\d+$/.test(raw)) {
    return null;
  }
  return Number(raw);
}

function parsePesosToCents(value: FormDataEntryValue | null): number | null {
  const raw = `${value ?? ""}`.trim().replace(/\s+/g, "").replace(/^\$/, "");
  if (!raw) {
    return null;
  }

  let normalized = raw;
  if (/^\d{1,3}(\.\d{3})+$/.test(raw)) {
    normalized = raw.replace(/\./g, "");
  } else if (/^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(raw)) {
    normalized = raw.replace(/\./g, "").replace(",", ".");
  } else if (/^\d+,\d{1,2}$/.test(raw)) {
    normalized = raw.replace(",", ".");
  } else if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed * 100);
}

function parsePriceInCents(value: FormDataEntryValue | null): number {
  return parsePesosToCents(value) ?? 0;
}

function parseSortOrder(value: FormDataEntryValue | null): number {
  const parsed = Number(`${value || "0"}`);
  return Number.isFinite(parsed) ? Math.floor(parsed) : 0;
}

function normalizeCatalogName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function isUniqueError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return true;
  }

  if (error && typeof error === "object" && "cause" in error) {
    return isUniqueError((error as { cause: unknown }).cause);
  }

  return false;
}

function redirectCatalogError(basePath: string, error: string): never {
  redirect(`${basePath}?error=${error}`);
}

async function resolveAuthenticatedTenant(formData: FormData): Promise<{
  basePath: string;
  tenantSlug: string;
  tenantId: string;
}> {
  const basePath = resolveBasePath(formData);
  const tenantSlug = resolveTenantSlug(formData);
  const authenticated = await isAdminAuthenticated(tenantSlug);

  if (!authenticated) {
    redirect(`${basePath}?error=auth`);
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });

  if (!tenant) {
    redirect(`${basePath}?error=tenant`);
  }

  return { basePath, tenantSlug, tenantId: tenant.id };
}

export async function loginAdminAction(formData: FormData): Promise<void> {
  const basePath = resolveBasePath(formData);
  const tenantSlug = resolveTenantSlug(formData);
  const password = `${formData.get("password") || ""}`;
  const isValid = await validateAdminPassword(tenantSlug, password);

  if (!isValid) {
    redirect(`${basePath}?error=invalid-password`);
  }

  await setAdminAuthenticated(tenantSlug);
  redirect(basePath);
}

export async function logoutAdminAction(formData: FormData): Promise<void> {
  const basePath = resolveBasePath(formData);
  const tenantSlug = resolveTenantSlug(formData);
  await clearAdminAuthenticated(tenantSlug);
  redirect(basePath);
}

export async function saveAdminSettingsAction(formData: FormData): Promise<void> {
  const basePath = resolveBasePath(formData);
  const tenantSlug = resolveTenantSlug(formData);
  const authenticated = await isAdminAuthenticated(tenantSlug);

  if (!authenticated) {
    redirect(`${basePath}?error=auth`);
  }

  const publicName = `${formData.get("publicName") || ""}`.trim();
  const description = `${formData.get("description") || ""}`.trim();
  const mapsUrl = `${formData.get("mapsUrl") || ""}`.trim();
  const phoneInput = `${formData.get("phone") || ""}`.trim();
  const normalizedPhone = normalizeBarbershopPhoneNumber(phoneInput);

  if (!normalizedPhone) {
    redirect(`${basePath}?error=phone`);
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });

  if (!tenant) {
    redirect(`${basePath}?error=tenant`);
  }

  const weeklySchedule = createDefaultWeeklySchedule();

  for (const { fieldName, weekday } of WEEKDAY_FIELDS) {
    weeklySchedule[weekday] = parseTimeList(`${formData.get(fieldName) || ""}`);
  }

  const expressSlots = parseTimeList(`${formData.get("expressSlots") || ""}`);

  const normalizedMapsUrl = /^https?:\/\//i.test(mapsUrl) ? mapsUrl : null;

  await prisma.barbershopTenantSettings.upsert({
    where: { tenantId: tenant.id },
    update: {
      publicName: publicName || null,
      description: description || null,
      mapsUrl: normalizedMapsUrl,
      phone: normalizedPhone,
      weeklySchedule,
      expressSlots,
    },
    create: {
      tenantId: tenant.id,
      publicName: publicName || null,
      description: description || null,
      mapsUrl: normalizedMapsUrl,
      phone: normalizedPhone,
      weeklySchedule,
      expressSlots,
    },
  });

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/barbershop`);
  revalidatePath(basePath);
  redirect(`${basePath}?saved=1`);
}

export async function saveRotisserieAdminAction(formData: FormData): Promise<void> {
  const { basePath, tenantSlug, tenantId } = await resolveAuthenticatedTenant(formData);

  const deliveryFeeRaw = `${formData.get("deliveryFeeInPesos") ?? ""}`.trim();
  const deliveryFeeInCents = deliveryFeeRaw ? parsePesosToCents(deliveryFeeRaw) : 0;
  if (deliveryFeeInCents === null) {
    redirectCatalogError(basePath, "invalid-amount");
  }

  const usesWeeklyMenu = tenantUsesWeeklyMenu(tenantSlug);
  const weeklyMenu = usesWeeklyMenu ? createEmptyWeeklyMenu() : null;
  if (weeklyMenu) {
    for (const { key, fieldName } of WEEKLY_MENU_DAYS) {
      const entry = `${formData.get(fieldName) || ""}`.trim();
      if (entry.length > 500) {
        redirectCatalogError(basePath, "weekly-menu-too-long");
      }
      weeklyMenu[key] = entry;
    }
  }

  const categoryIds = [...formData.keys()]
    .filter((key) => key.startsWith("categoryId:"))
    .map((key) => `${formData.get(key) || ""}`)
    .filter(Boolean);
  const productIds = [...formData.keys()]
    .filter((key) => key.startsWith("productId:"))
    .map((key) => `${formData.get(key) || ""}`)
    .filter(Boolean);

  const categoryUpdates: Array<{
    id: string;
    name: string;
    normalizedName: string;
    sortOrder: number;
    isAvailable: boolean;
  }> = [];
  const seenCategoryNames = new Set<string>();

  for (const categoryId of categoryIds) {
    const name = `${formData.get(`categoryName:${categoryId}`) || ""}`.trim();
    const normalizedName = normalizeCatalogName(name);
    if (!name || !normalizedName) {
      continue;
    }
    if (seenCategoryNames.has(normalizedName)) {
      redirectCatalogError(basePath, "duplicate-catalog-name");
    }
    seenCategoryNames.add(normalizedName);
    categoryUpdates.push({
      id: categoryId,
      name,
      normalizedName,
      sortOrder: parseSortOrder(formData.get(`categorySort:${categoryId}`)),
      isAvailable: `${formData.get(`categoryAvailable:${categoryId}`) || "yes"}` === "yes",
    });
  }

  const productUpdates: Array<{
    id: string;
    categoryId: string;
    name: string;
    normalizedName: string;
    description: string | null;
    priceInCents: number;
    stockQuantity: number | null;
    sortOrder: number;
    isAvailable: boolean;
  }> = [];
  const seenProductNames = new Set<string>();

  for (const productId of productIds) {
    const name = `${formData.get(`name:${productId}`) || ""}`.trim();
    const normalizedName = normalizeCatalogName(name);
    const categoryId = `${formData.get(`category:${productId}`) || ""}`;
    if (!name || !normalizedName || !categoryId) {
      continue;
    }
    if (seenProductNames.has(normalizedName)) {
      redirectCatalogError(basePath, "duplicate-catalog-name");
    }
    seenProductNames.add(normalizedName);

    const priceInCents = parsePesosToCents(formData.get(`price:${productId}`));
    const stockRaw = `${formData.get(`stock:${productId}`) ?? ""}`.trim();
    const stockQuantity = stockRaw ? parseOptionalNonNegativeInt(stockRaw) : null;
    if (priceInCents === null || (stockRaw && stockQuantity === null)) {
      redirectCatalogError(basePath, "invalid-amount");
    }

    productUpdates.push({
      id: productId,
      categoryId,
      name,
      normalizedName,
      description: `${formData.get(`description:${productId}`) || ""}`.trim() || null,
      priceInCents,
      stockQuantity,
      sortOrder: parseSortOrder(formData.get(`sort:${productId}`)),
      isAvailable: `${formData.get(`available:${productId}`) || "yes"}` === "yes",
    });
  }

  const [settings, existingCategories, existingProducts] = await Promise.all([
    prisma.rotisserieTenantSettings.findUnique({
      where: { tenantId },
      select: rotisserieSettingsSelect(tenantSlug),
    }),
    prisma.rotisserieCategory.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        normalizedName: true,
        sortOrder: true,
        isAvailable: true,
      },
    }),
    prisma.rotisserieProduct.findMany({
      where: { tenantId },
      select: {
        id: true,
        categoryId: true,
        name: true,
        normalizedName: true,
        description: true,
        priceInCents: true,
        stockQuantity: true,
        sortOrder: true,
        isAvailable: true,
      },
    }),
  ]);

  const categoriesById = new Map(existingCategories.map((category) => [category.id, category]));
  const productsById = new Map(existingProducts.map((product) => [product.id, product]));
  const changedCategories = categoryUpdates.filter((category) => {
    const current = categoriesById.get(category.id);
    if (!current) {
      return false;
    }

    return (
      current.name !== category.name ||
      current.normalizedName !== category.normalizedName ||
      current.sortOrder !== category.sortOrder ||
      current.isAvailable !== category.isAvailable
    );
  });

  const writableProducts: typeof productUpdates = [];
  const categoryMoves: Array<{ fromCategoryId: string; toCategoryId: string }> = [];

  for (const product of productUpdates) {
    const current = productsById.get(product.id);
    const category = categoriesById.get(product.categoryId);
    if (!current || !category) {
      continue;
    }

    if (current.categoryId !== category.id) {
      categoryMoves.push({ fromCategoryId: current.categoryId, toCategoryId: category.id });
    }

    if (
      current.categoryId !== product.categoryId ||
      current.name !== product.name ||
      current.normalizedName !== product.normalizedName ||
      current.description !== product.description ||
      current.priceInCents !== product.priceInCents ||
      current.stockQuantity !== product.stockQuantity ||
      current.sortOrder !== product.sortOrder ||
      current.isAvailable !== product.isAvailable
    ) {
      writableProducts.push(product);
    }
  }

  const productsPerCategory = new Map<string, number>();
  for (const product of existingProducts) {
    productsPerCategory.set(product.categoryId, (productsPerCategory.get(product.categoryId) ?? 0) + 1);
  }
  for (const move of categoryMoves) {
    productsPerCategory.set(move.fromCategoryId, (productsPerCategory.get(move.fromCategoryId) ?? 1) - 1);
  }
  for (const move of categoryMoves) {
    const nextCount = (productsPerCategory.get(move.toCategoryId) ?? 0) + 1;
    if (nextCount > 50) {
      redirectCatalogError(basePath, "category-product-limit");
    }
    productsPerCategory.set(move.toCategoryId, nextCount);
  }

  const deliveryFeeChanged = settings?.deliveryFeeInCents !== deliveryFeeInCents;
  const weeklyMenuChanged =
    weeklyMenu !== null &&
    JSON.stringify(resolveWeeklyMenu(settings?.weeklyMenu)) !== JSON.stringify(weeklyMenu);

  try {
    if (deliveryFeeChanged || weeklyMenuChanged) {
      await prisma.rotisserieTenantSettings.upsert({
        where: { tenantId },
        update:
          weeklyMenu !== null
            ? { deliveryFeeInCents, weeklyMenu }
            : { deliveryFeeInCents },
        create:
          weeklyMenu !== null
            ? { tenantId, deliveryFeeInCents, weeklyMenu }
            : { tenantId, deliveryFeeInCents },
      });
    }

    for (const category of changedCategories) {
      const current = categoriesById.get(category.id);
      if (!current || current.normalizedName === category.normalizedName) {
        continue;
      }

      await prisma.rotisserieCategory.updateMany({
        where: { id: category.id, tenantId },
        data: { normalizedName: `pending:${category.id}` },
      });
    }

    for (const category of changedCategories) {
      await prisma.rotisserieCategory.updateMany({
        where: { id: category.id, tenantId },
        data: {
          name: category.name,
          normalizedName: category.normalizedName,
          sortOrder: category.sortOrder,
          isAvailable: category.isAvailable,
        },
      });
    }

    for (const product of writableProducts) {
      const current = productsById.get(product.id);
      if (!current || current.normalizedName === product.normalizedName) {
        continue;
      }

      await prisma.rotisserieProduct.updateMany({
        where: { id: product.id, tenantId },
        data: { normalizedName: `pending:${product.id}` },
      });
    }

    for (const product of writableProducts) {
      await prisma.rotisserieProduct.updateMany({
        where: { id: product.id, tenantId },
        data: {
          categoryId: product.categoryId,
          name: product.name,
          normalizedName: product.normalizedName,
          description: product.description,
          priceInCents: product.priceInCents,
          stockQuantity: product.stockQuantity,
          sortOrder: product.sortOrder,
          isAvailable: product.isAvailable,
        },
      });
    }
  } catch (error) {
    if (isUniqueError(error)) {
      redirectCatalogError(basePath, "duplicate-catalog-name");
    }

    console.error("Failed to save rotisserie admin", error);
    redirectCatalogError(basePath, "save");
  }

  if (deliveryFeeChanged || weeklyMenuChanged || changedCategories.length > 0 || writableProducts.length > 0) {
    revalidatePath("/");
    revalidatePath(`/${tenantSlug}/rotisserie/carta`);
    revalidatePath(basePath);
  }

  redirect(`${basePath}?saved=1`);
}

export async function createRotisserieProductAction(categoryId: string, formData: FormData): Promise<void> {
  const { basePath, tenantSlug, tenantId } = await resolveAuthenticatedTenant(formData);

  const name = `${formData.get(`newProductName:${categoryId}`) || ""}`.trim();
  const normalizedName = normalizeCatalogName(name);
  const description = `${formData.get(`newProductDescription:${categoryId}`) || ""}`.trim();

  if (!categoryId || !name || !normalizedName) {
    redirect(basePath);
  }

  const category = await prisma.rotisserieCategory.findFirst({
    where: { id: categoryId, tenantId },
    select: { id: true },
  });

  if (!category) {
    redirect(basePath);
  }

  const [tenantProductCount, categoryProductCount, lastInCategory] = await Promise.all([
    prisma.rotisserieProduct.count({ where: { tenantId } }),
    prisma.rotisserieProduct.count({ where: { tenantId, categoryId: category.id } }),
    prisma.rotisserieProduct.findFirst({
      where: { tenantId, categoryId: category.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    }),
  ]);

  if (tenantProductCount >= 300) {
    redirectCatalogError(basePath, "product-limit");
  }

  if (categoryProductCount >= 50) {
    redirectCatalogError(basePath, "category-product-limit");
  }

  try {
    await prisma.rotisserieProduct.create({
      data: {
        tenantId,
        categoryId: category.id,
        name,
        normalizedName,
        description: description || null,
        priceInCents: parsePriceInCents(formData.get(`newProductPrice:${categoryId}`)),
        stockQuantity: parseOptionalNonNegativeInt(formData.get(`newProductStock:${categoryId}`)),
        sortOrder: (lastInCategory?.sortOrder ?? 0) + 1,
      },
    });
  } catch (error) {
    if (isUniqueError(error)) {
      redirectCatalogError(basePath, "duplicate-catalog-name");
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/rotisserie/carta`);
  revalidatePath(basePath);
  redirect(`${basePath}?saved=1`);
}

export async function createRotisserieCategoryAction(formData: FormData): Promise<void> {
  const { basePath, tenantSlug, tenantId } = await resolveAuthenticatedTenant(formData);

  const newCategoryName = `${formData.get("newCategoryName") || ""}`.trim();
  const normalizedNewCategoryName = normalizeCatalogName(newCategoryName);

  if (!newCategoryName || !normalizedNewCategoryName) {
    redirect(basePath);
  }

  const categoryCount = await prisma.rotisserieCategory.count({ where: { tenantId } });

  if (categoryCount >= 30) {
    redirectCatalogError(basePath, "category-limit");
  }

  try {
    await prisma.rotisserieCategory.create({
      data: {
        tenantId,
        name: newCategoryName,
        normalizedName: normalizedNewCategoryName,
        sortOrder: parseSortOrder(formData.get("newCategorySort")),
      },
    });
  } catch (error) {
    if (isUniqueError(error)) {
      redirectCatalogError(basePath, "duplicate-catalog-name");
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/rotisserie/carta`);
  revalidatePath(basePath);
  redirect(`${basePath}?saved=1`);
}

function swapPositions<T>(items: T[], index: number, direction: "up" | "down"): T[] | null {
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || targetIndex < 0 || targetIndex >= items.length) {
    return null;
  }

  const reordered = [...items];
  const moved = reordered[index];
  reordered[index] = reordered[targetIndex];
  reordered[targetIndex] = moved;
  return reordered;
}

export async function reorderRotisserieProductAction(
  productId: string,
  direction: "up" | "down",
  formData: FormData,
): Promise<void> {
  const { basePath, tenantSlug, tenantId } = await resolveAuthenticatedTenant(formData);

  const product = await prisma.rotisserieProduct.findFirst({
    where: { id: productId, tenantId },
    select: { categoryId: true },
  });

  if (product) {
    const siblings = await prisma.rotisserieProduct.findMany({
      where: { tenantId, categoryId: product.categoryId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true },
    });

    const reordered = swapPositions(siblings, siblings.findIndex((item) => item.id === productId), direction);

    if (reordered) {
      await prisma.$transaction(
        reordered.map((item, index) =>
          prisma.rotisserieProduct.updateMany({
            where: { id: item.id, tenantId },
            data: { sortOrder: index + 1 },
          }),
        ),
      );
    }
  }

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/rotisserie/carta`);
  revalidatePath(basePath);
  redirect(basePath);
}

export async function reorderRotisserieCategoryAction(
  categoryId: string,
  direction: "up" | "down",
  formData: FormData,
): Promise<void> {
  const { basePath, tenantSlug, tenantId } = await resolveAuthenticatedTenant(formData);

  const categories = await prisma.rotisserieCategory.findMany({
    where: { tenantId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true },
  });

  const reordered = swapPositions(categories, categories.findIndex((item) => item.id === categoryId), direction);

  if (reordered) {
    await prisma.$transaction(
      reordered.map((item, index) =>
        prisma.rotisserieCategory.updateMany({
          where: { id: item.id, tenantId },
          data: { sortOrder: index + 1 },
        }),
      ),
    );
  }

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/rotisserie/carta`);
  revalidatePath(basePath);
  redirect(basePath);
}

export async function moveRotisserieProductAction(productId: string, formData: FormData): Promise<void> {
  const { basePath, tenantSlug, tenantId } = await resolveAuthenticatedTenant(formData);
  const targetCategoryId = `${formData.get(`moveCategory:${productId}`) || ""}`;

  if (!productId || !targetCategoryId) {
    redirect(basePath);
  }

  const [product, targetCategory] = await Promise.all([
    prisma.rotisserieProduct.findFirst({
      where: { id: productId, tenantId },
      select: { categoryId: true },
    }),
    prisma.rotisserieCategory.findFirst({
      where: { id: targetCategoryId, tenantId },
      select: { id: true, name: true },
    }),
  ]);

  if (!product || !targetCategory) {
    redirect(basePath);
  }

  if (product.categoryId === targetCategory.id) {
    redirect(basePath);
  }

  const categoryProductCount = await prisma.rotisserieProduct.count({
    where: { tenantId, categoryId: targetCategory.id },
  });

  if (categoryProductCount >= 50) {
    redirectCatalogError(basePath, "category-product-limit");
  }

  const lastInTarget = await prisma.rotisserieProduct.findFirst({
    where: { tenantId, categoryId: targetCategory.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.rotisserieProduct.updateMany({
    where: { id: productId, tenantId },
    data: {
      categoryId: targetCategory.id,
      sortOrder: (lastInTarget?.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/rotisserie/carta`);
  revalidatePath(basePath);
  redirect(`${basePath}?moved=${encodeURIComponent(targetCategory.name)}`);
}

export async function toggleRotisserieProductVisibilityAction(productId: string, formData: FormData): Promise<void> {
  const { basePath, tenantSlug, tenantId } = await resolveAuthenticatedTenant(formData);

  if (productId) {
    const product = await prisma.rotisserieProduct.findFirst({
      where: { id: productId, tenantId },
      select: { isAvailable: true },
    });

    if (product) {
      await prisma.rotisserieProduct.updateMany({
        where: { id: productId, tenantId },
        data: { isAvailable: !product.isAvailable },
      });
    }
  }

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/rotisserie/carta`);
  revalidatePath(basePath);
  redirect(`${basePath}?saved=1`);
}

export async function toggleRotisserieCategoryVisibilityAction(categoryId: string, formData: FormData): Promise<void> {
  const { basePath, tenantSlug, tenantId } = await resolveAuthenticatedTenant(formData);

  if (categoryId) {
    const category = await prisma.rotisserieCategory.findFirst({
      where: { id: categoryId, tenantId },
      select: { isAvailable: true },
    });

    if (category) {
      await prisma.rotisserieCategory.updateMany({
        where: { id: categoryId, tenantId },
        data: { isAvailable: !category.isAvailable },
      });
    }
  }

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/rotisserie/carta`);
  revalidatePath(basePath);
  redirect(`${basePath}?saved=1`);
}

export async function deleteRotisserieProductAction(productId: string, formData: FormData): Promise<void> {
  const { basePath, tenantSlug, tenantId } = await resolveAuthenticatedTenant(formData);

  if (productId) {
    await prisma.rotisserieProduct.deleteMany({
      where: { id: productId, tenantId },
    });
  }

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/rotisserie/carta`);
  revalidatePath(basePath);
  redirect(`${basePath}?saved=1`);
}

export async function deleteRotisserieCategoryAction(categoryId: string, formData: FormData): Promise<void> {
  const { basePath, tenantSlug, tenantId } = await resolveAuthenticatedTenant(formData);

  if (!categoryId) {
    redirect(basePath);
  }

  const productCount = await prisma.rotisserieProduct.count({
    where: { tenantId, categoryId },
  });

  if (productCount > 0) {
    redirectCatalogError(basePath, "category-not-empty");
  }

  await prisma.rotisserieCategory.deleteMany({
    where: { id: categoryId, tenantId },
  });

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/rotisserie/carta`);
  revalidatePath(basePath);
  redirect(`${basePath}?saved=1`);
}

export async function cancelAppointmentAction(formData: FormData): Promise<void> {
  const basePath = resolveBasePath(formData);
  const tenantSlug = resolveTenantSlug(formData);
  const authenticated = await isAdminAuthenticated(tenantSlug);

  if (!authenticated) {
    redirect(`${basePath}?error=auth`);
  }

  const appointmentId = `${formData.get("appointmentId") || ""}`;
  const tenantId = `${formData.get("tenantId") || ""}`;

  if (!appointmentId || !tenantId) {
    redirect(basePath);
  }

  await prisma.barbershopAppointment.deleteMany({
    where: {
      id: appointmentId,
      tenantId,
    },
  });

  revalidatePath("/");
  revalidatePath(`/${tenantSlug}/barbershop`);
  revalidatePath(basePath);
  redirect(basePath);
}