-- CreateTable
CREATE TABLE "booth_reservations" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "booth_purpose" TEXT NOT NULL,
    "brand_description" TEXT NOT NULL,
    "visitor_takeaway" TEXT NOT NULL,
    "exhibition_materials" TEXT,
    "equipment_needs" TEXT,
    "people_count" TEXT NOT NULL,
    "people_names" TEXT,
    "website_or_social" TEXT,
    "additional_comment" TEXT,
    "locale" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booth_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booth_reservations_status_created_at_idx" ON "booth_reservations"("status", "created_at");

-- CreateIndex
CREATE INDEX "booth_reservations_email_idx" ON "booth_reservations"("email");
