-- CreateTable
CREATE TABLE "fetchedFeed" (
    "id" TEXT NOT NULL,
    "feedCount" INTEGER NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fetchedFeed_pkey" PRIMARY KEY ("id")
);
