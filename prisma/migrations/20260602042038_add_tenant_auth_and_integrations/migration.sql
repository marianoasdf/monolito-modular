-- CreateTable
CREATE TABLE "tenant_auth" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "adminPasswordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_integrations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_auth_tenantId_key" ON "tenant_auth"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_auth_tenantId_idx" ON "tenant_auth"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_integrations_tenantId_idx" ON "tenant_integrations"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_integrations_tenantId_provider_key" ON "tenant_integrations"("tenantId", "provider");

-- AddForeignKey
ALTER TABLE "tenant_auth" ADD CONSTRAINT "tenant_auth_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_integrations" ADD CONSTRAINT "tenant_integrations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
