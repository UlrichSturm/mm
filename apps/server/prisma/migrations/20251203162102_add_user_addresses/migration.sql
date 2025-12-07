-- AlterTable
ALTER TABLE "users" ADD COLUMN "delivery_address" TEXT,
ADD COLUMN "delivery_postal_code" TEXT,
ADD COLUMN "delivery_city" TEXT,
ADD COLUMN "delivery_country" TEXT DEFAULT 'DE',
ADD COLUMN "billing_address" TEXT,
ADD COLUMN "billing_postal_code" TEXT,
ADD COLUMN "billing_city" TEXT,
ADD COLUMN "billing_country" TEXT DEFAULT 'DE';
