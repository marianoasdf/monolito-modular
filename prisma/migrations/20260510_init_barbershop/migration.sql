-- CreateEnum
CREATE TYPE "BarbershopAppointmentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barbershop_customers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barbershop_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barbershop_appointments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "serviceCode" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "durationInMinutes" INTEGER NOT NULL,
    "status" "BarbershopAppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barbershop_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "barbershop_customers_tenantId_idx" ON "barbershop_customers"("tenantId");

-- CreateIndex
CREATE INDEX "barbershop_customers_tenantId_phoneNumber_idx" ON "barbershop_customers"("tenantId", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "barbershop_customers_tenantId_id_key" ON "barbershop_customers"("tenantId", "id");

-- CreateIndex
CREATE INDEX "barbershop_appointments_tenantId_idx" ON "barbershop_appointments"("tenantId");

-- CreateIndex
CREATE INDEX "barbershop_appointments_tenantId_customerId_idx" ON "barbershop_appointments"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "barbershop_appointments_tenantId_startsAt_idx" ON "barbershop_appointments"("tenantId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "barbershop_appointments_tenantId_barberId_startsAt_key" ON "barbershop_appointments"("tenantId", "barberId", "startsAt");

-- AddForeignKey
ALTER TABLE "barbershop_customers" ADD CONSTRAINT "barbershop_customers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbershop_appointments" ADD CONSTRAINT "barbershop_appointments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbershop_appointments" ADD CONSTRAINT "barbershop_appointments_tenantId_customerId_fkey" FOREIGN KEY ("tenantId", "customerId") REFERENCES "barbershop_customers"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;