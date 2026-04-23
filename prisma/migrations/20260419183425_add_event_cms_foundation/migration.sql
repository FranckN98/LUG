-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "postalCode" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "googleMapsUrl" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "venue_translations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "venue_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "display_name" TEXT DEFAULT '',
    "address_label" TEXT DEFAULT '',
    "city_label" TEXT DEFAULT '',
    "short_description" TEXT DEFAULT '',
    CONSTRAINT "venue_translations_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "starts_at" DATETIME,
    "ends_at" DATETIME,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Berlin',
    "is_date_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "hero_image_url" TEXT,
    "hero_badge" TEXT,
    "primary_cta_url" TEXT,
    "secondary_cta_url" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "contact_instagram" TEXT,
    "show_price" BOOLEAN NOT NULL DEFAULT true,
    "price_blurred" BOOLEAN NOT NULL DEFAULT false,
    "ticketing_status" TEXT NOT NULL DEFAULT 'coming_soon',
    "published_at" DATETIME,
    "venue_id" TEXT,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_translations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT DEFAULT '',
    "short_description" TEXT DEFAULT '',
    "long_description" TEXT DEFAULT '',
    "hero_text" TEXT DEFAULT '',
    "audience_label" TEXT DEFAULT '',
    "badge_text" TEXT DEFAULT '',
    "primary_cta_label" TEXT DEFAULT '',
    "secondary_cta_label" TEXT DEFAULT '',
    "gallery_intro" TEXT DEFAULT '',
    "ticket_info" TEXT DEFAULT '',
    "pdf_title" TEXT DEFAULT '',
    "pdf_description" TEXT DEFAULT '',
    "seo_title" TEXT DEFAULT '',
    "seo_description" TEXT DEFAULT '',
    "date_fallback_label" TEXT DEFAULT '',
    "date_tba_label" TEXT DEFAULT '',
    CONSTRAINT "event_translations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_prices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price_cents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "purchase_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "event_prices_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_highlights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "event_highlights_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_highlight_translations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_highlight_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT DEFAULT '',
    CONSTRAINT "event_highlight_translations_event_highlight_id_fkey" FOREIGN KEY ("event_highlight_id") REFERENCES "event_highlights" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_price_translations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_price_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "info_text" TEXT DEFAULT '',
    CONSTRAINT "event_price_translations_event_price_id_fkey" FOREIGN KEY ("event_price_id") REFERENCES "event_prices" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "schedule_sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "schedule_sections_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "schedule_section_translations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedule_section_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT DEFAULT '',
    CONSTRAINT "schedule_section_translations_schedule_section_id_fkey" FOREIGN KEY ("schedule_section_id") REFERENCES "schedule_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "schedule_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "section_id" TEXT,
    "start_time" TEXT,
    "end_time" TEXT,
    "session_type" TEXT NOT NULL DEFAULT 'other',
    "room" TEXT DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "schedule_items_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "schedule_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "schedule_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "schedule_item_translations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedule_item_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT DEFAULT '',
    "description" TEXT DEFAULT '',
    CONSTRAINT "schedule_item_translations_schedule_item_id_fkey" FOREIGN KEY ("schedule_item_id") REFERENCES "schedule_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "speakers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "display_name" TEXT NOT NULL,
    "photo_url" TEXT,
    "linkedin_url" TEXT,
    "instagram_url" TEXT,
    "website_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "speaker_translations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "speaker_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "role" TEXT DEFAULT '',
    "organization" TEXT DEFAULT '',
    "short_bio" TEXT DEFAULT '',
    "long_bio" TEXT DEFAULT '',
    CONSTRAINT "speaker_translations_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "speakers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_speakers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "speaker_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "event_speakers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_speakers_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "speakers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "schedule_item_speakers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedule_item_id" TEXT NOT NULL,
    "speaker_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "schedule_item_speakers_schedule_item_id_fkey" FOREIGN KEY ("schedule_item_id") REFERENCES "schedule_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "schedule_item_speakers_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "speakers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'partner',
    "logo_url" TEXT,
    "website_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "organization_translations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "short_description" TEXT DEFAULT '',
    CONSTRAINT "organization_translations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'partner',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "event_organizations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'gallery',
    "url" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "event_media_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_media_translations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_media_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "alt_text" TEXT DEFAULT '',
    "caption" TEXT DEFAULT '',
    CONSTRAINT "event_media_translations_event_media_id_fkey" FOREIGN KEY ("event_media_id") REFERENCES "event_media" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'event_book',
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "event_documents_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_document_translations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_document_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    CONSTRAINT "event_document_translations_event_document_id_fkey" FOREIGN KEY ("event_document_id") REFERENCES "event_documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "venues_city_idx" ON "venues"("city");

-- CreateIndex
CREATE UNIQUE INDEX "venue_translations_venue_id_locale_key" ON "venue_translations"("venue_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "events_year_key" ON "events"("year");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_status_sort_order_idx" ON "events"("status", "sort_order");

-- CreateIndex
CREATE INDEX "events_published_at_idx" ON "events"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "event_translations_event_id_locale_key" ON "event_translations"("event_id", "locale");

-- CreateIndex
CREATE INDEX "event_prices_event_id_sort_order_idx" ON "event_prices"("event_id", "sort_order");

-- CreateIndex
CREATE INDEX "event_highlights_event_id_sort_order_idx" ON "event_highlights"("event_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "event_highlight_translations_event_highlight_id_locale_key" ON "event_highlight_translations"("event_highlight_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "event_price_translations_event_price_id_locale_key" ON "event_price_translations"("event_price_id", "locale");

-- CreateIndex
CREATE INDEX "schedule_sections_event_id_sort_order_idx" ON "schedule_sections"("event_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_section_translations_schedule_section_id_locale_key" ON "schedule_section_translations"("schedule_section_id", "locale");

-- CreateIndex
CREATE INDEX "schedule_items_event_id_sort_order_idx" ON "schedule_items"("event_id", "sort_order");

-- CreateIndex
CREATE INDEX "schedule_items_section_id_sort_order_idx" ON "schedule_items"("section_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_item_translations_schedule_item_id_locale_key" ON "schedule_item_translations"("schedule_item_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "speakers_slug_key" ON "speakers"("slug");

-- CreateIndex
CREATE INDEX "speakers_is_visible_sort_order_idx" ON "speakers"("is_visible", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "speaker_translations_speaker_id_locale_key" ON "speaker_translations"("speaker_id", "locale");

-- CreateIndex
CREATE INDEX "event_speakers_event_id_sort_order_idx" ON "event_speakers"("event_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "event_speakers_event_id_speaker_id_key" ON "event_speakers"("event_id", "speaker_id");

-- CreateIndex
CREATE INDEX "schedule_item_speakers_schedule_item_id_sort_order_idx" ON "schedule_item_speakers"("schedule_item_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_item_speakers_schedule_item_id_speaker_id_key" ON "schedule_item_speakers"("schedule_item_id", "speaker_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_category_is_visible_sort_order_idx" ON "organizations"("category", "is_visible", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "organization_translations_organization_id_locale_key" ON "organization_translations"("organization_id", "locale");

-- CreateIndex
CREATE INDEX "event_organizations_event_id_category_sort_order_idx" ON "event_organizations"("event_id", "category", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "event_organizations_event_id_organization_id_category_key" ON "event_organizations"("event_id", "organization_id", "category");

-- CreateIndex
CREATE INDEX "event_media_event_id_type_sort_order_idx" ON "event_media"("event_id", "type", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "event_media_translations_event_media_id_locale_key" ON "event_media_translations"("event_media_id", "locale");

-- CreateIndex
CREATE INDEX "event_documents_event_id_type_sort_order_idx" ON "event_documents"("event_id", "type", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "event_document_translations_event_document_id_locale_key" ON "event_document_translations"("event_document_id", "locale");
