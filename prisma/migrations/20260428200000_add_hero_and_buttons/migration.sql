-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "title_fr" TEXT,
    "title_de" TEXT,
    "title_en" TEXT,
    "subtitle_fr" TEXT,
    "subtitle_de" TEXT,
    "subtitle_en" TEXT,
    "alt_text_fr" TEXT,
    "alt_text_de" TEXT,
    "alt_text_en" TEXT,
    "link_type" TEXT,
    "link_target" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_buttons" (
    "id" TEXT NOT NULL,
    "label_fr" TEXT NOT NULL,
    "label_de" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,
    "link_type" TEXT NOT NULL DEFAULT 'internal',
    "link_target" TEXT NOT NULL,
    "color_variant" TEXT NOT NULL DEFAULT 'red',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "open_in_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_buttons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hero_slides_is_active_sort_order_idx" ON "hero_slides"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "home_buttons_is_active_display_order_idx" ON "home_buttons"("is_active", "display_order");
