-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL DEFAULT '',
    "website_url" TEXT,
    "category" TEXT NOT NULL DEFAULT 'partner',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "partners_visible_sort_order_idx" ON "partners"("visible", "sort_order");
