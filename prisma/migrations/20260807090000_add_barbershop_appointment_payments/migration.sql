ALTER TABLE "barbershop_appointments"
ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'cash',
ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'not_required';
