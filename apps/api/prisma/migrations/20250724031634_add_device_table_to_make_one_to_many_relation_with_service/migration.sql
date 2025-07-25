/*
  Warnings:

  - You are about to drop the column `completedAt` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `deviceType` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `problemDescription` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "completedAt",
DROP COLUMN "deviceType",
DROP COLUMN "problemDescription",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "deviceType" TEXT NOT NULL,
    "problemDescription" TEXT NOT NULL,
    "accessoriesLeft" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
