-- CreateTable
CREATE TABLE "rotisserie_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rotisserie_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rotisserie_products" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceInCents" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rotisserie_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rotisserie_orders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "fulfillmentType" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalInCents" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rotisserie_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rotisserie_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "unitPriceInCents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lineTotalInCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rotisserie_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rotisserie_categories_tenantId_idx" ON "rotisserie_categories"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "rotisserie_categories_tenantId_id_key" ON "rotisserie_categories"("tenantId", "id");

-- CreateIndex
CREATE INDEX "rotisserie_products_tenantId_idx" ON "rotisserie_products"("tenantId");

-- CreateIndex
CREATE INDEX "rotisserie_products_tenantId_categoryId_idx" ON "rotisserie_products"("tenantId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "rotisserie_products_tenantId_id_key" ON "rotisserie_products"("tenantId", "id");

-- CreateIndex
CREATE INDEX "rotisserie_orders_tenantId_idx" ON "rotisserie_orders"("tenantId");

-- CreateIndex
CREATE INDEX "rotisserie_orders_tenantId_createdAt_idx" ON "rotisserie_orders"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "rotisserie_order_items_tenantId_orderId_idx" ON "rotisserie_order_items"("tenantId", "orderId");

-- AddForeignKey
ALTER TABLE "rotisserie_categories" ADD CONSTRAINT "rotisserie_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotisserie_products" ADD CONSTRAINT "rotisserie_products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotisserie_products" ADD CONSTRAINT "rotisserie_products_tenantId_categoryId_fkey" FOREIGN KEY ("tenantId", "categoryId") REFERENCES "rotisserie_categories"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotisserie_orders" ADD CONSTRAINT "rotisserie_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotisserie_order_items" ADD CONSTRAINT "rotisserie_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "rotisserie_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
