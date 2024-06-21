/*
  Warnings:

  - You are about to drop the column `discount` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `priceAfterDiscount` on the `Products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "discount" DOUBLE PRECISION,
ADD COLUMN     "totalCostAfterDiscount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "discount",
DROP COLUMN "priceAfterDiscount";
