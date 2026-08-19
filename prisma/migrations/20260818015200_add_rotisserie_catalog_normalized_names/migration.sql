ALTER TABLE "rotisserie_categories" ADD COLUMN "normalizedName" TEXT;
ALTER TABLE "rotisserie_products" ADD COLUMN "normalizedName" TEXT;

UPDATE "rotisserie_categories"
SET "normalizedName" = lower(regexp_replace(trim("name"), '\s+', ' ', 'g'));

UPDATE "rotisserie_products"
SET "normalizedName" = lower(regexp_replace(trim("name"), '\s+', ' ', 'g'));

ALTER TABLE "rotisserie_categories" ALTER COLUMN "normalizedName" SET NOT NULL;
ALTER TABLE "rotisserie_products" ALTER COLUMN "normalizedName" SET NOT NULL;

CREATE UNIQUE INDEX "rotisserie_categories_tenantId_normalizedName_key" ON "rotisserie_categories"("tenantId", "normalizedName");
CREATE UNIQUE INDEX "rotisserie_products_tenantId_normalizedName_key" ON "rotisserie_products"("tenantId", "normalizedName");
