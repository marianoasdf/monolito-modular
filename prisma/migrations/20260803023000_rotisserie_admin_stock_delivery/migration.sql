ALTER TABLE "rotisserie_products"
ADD COLUMN "stockQuantity" INTEGER,
ADD COLUMN "isAvailable" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "rotisserie_orders"
ADD COLUMN "deliveryFeeInCents" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "rotisserie_tenant_settings" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "deliveryFeeInCents" INTEGER NOT NULL DEFAULT 250000,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "rotisserie_tenant_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rotisserie_tenant_settings_tenantId_key" ON "rotisserie_tenant_settings"("tenantId");
CREATE INDEX "rotisserie_tenant_settings_tenantId_idx" ON "rotisserie_tenant_settings"("tenantId");

ALTER TABLE "rotisserie_tenant_settings"
ADD CONSTRAINT "rotisserie_tenant_settings_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
