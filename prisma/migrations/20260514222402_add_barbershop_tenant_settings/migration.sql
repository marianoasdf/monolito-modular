-- CreateTable
CREATE TABLE "barbershop_tenant_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "publicName" TEXT,
    "description" TEXT,
    "phone" TEXT,
    "weeklySchedule" JSONB,
    "expressSlots" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barbershop_tenant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "barbershop_tenant_settings_tenantId_key" ON "barbershop_tenant_settings"("tenantId");

-- CreateIndex
CREATE INDEX "barbershop_tenant_settings_tenantId_idx" ON "barbershop_tenant_settings"("tenantId");

-- AddForeignKey
ALTER TABLE "barbershop_tenant_settings" ADD CONSTRAINT "barbershop_tenant_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
