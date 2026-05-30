/*
  Warnings:

  - You are about to drop the column `creator` on the `Article` table. All the data in the column will be lost.
  - Added the required column `sourceName` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceUrl` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "creator",
ADD COLUMN     "sourceName" TEXT NOT NULL,
ADD COLUMN     "sourceUrl" TEXT NOT NULL;
