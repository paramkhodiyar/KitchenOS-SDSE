-- CreateEnum
CREATE TYPE "RawMaterialStatus" AS ENUM ('AVAILABLE', 'LOW', 'OUT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'CASHIER';
ALTER TYPE "Role" ADD VALUE 'KITCHEN';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "isInitialized" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RawMaterialStatus" NOT NULL,
    "overrideUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverrideLog" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OverrideLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverrideLog" ADD CONSTRAINT "OverrideLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverrideLog" ADD CONSTRAINT "OverrideLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverrideLog" ADD CONSTRAINT "OverrideLog_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
