/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Cv` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cv" DROP COLUMN "fileUrl",
ADD COLUMN     "parsedData" TEXT,
ADD COLUMN     "parsedUpdatedAt" TIMESTAMP(3);
