-- AlterTable
ALTER TABLE "social_links" ADD COLUMN "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "social_links_is_featured_idx" ON "social_links"("is_featured");
