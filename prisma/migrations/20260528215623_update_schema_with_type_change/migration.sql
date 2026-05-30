/*
  Warnings:

  - Changed the type of `pubDate` on the `Article` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "pubDate",
ADD COLUMN     "pubDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Cluster" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Article_pubDate_idx" ON "Article"("pubDate" DESC);
