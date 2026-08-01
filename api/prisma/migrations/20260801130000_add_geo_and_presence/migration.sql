-- AlterTable
ALTER TABLE "PageView" ADD COLUMN "country" TEXT;
ALTER TABLE "PageView" ADD COLUMN "countryCode" TEXT;
ALTER TABLE "PageView" ADD COLUMN "city" TEXT;

-- CreateIndex
CREATE INDEX "PageView_country_idx" ON "PageView"("country");

-- CreateTable
CREATE TABLE "VisitorPresence" (
    "visitorId" TEXT NOT NULL,
    "path" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitorPresence_pkey" PRIMARY KEY ("visitorId")
);

-- CreateIndex
CREATE INDEX "VisitorPresence_lastSeen_idx" ON "VisitorPresence"("lastSeen");
