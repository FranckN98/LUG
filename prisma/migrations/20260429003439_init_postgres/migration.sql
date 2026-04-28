-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "tags" TEXT DEFAULT 'levelup_event',
    "first_name" TEXT,
    "last_name" TEXT,
    "address" TEXT,
    "city" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "unsubscribe_token" TEXT,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_settings" (
    "id" TEXT NOT NULL,
    "is_communication_mode_active" BOOLEAN NOT NULL DEFAULT false,
    "popup_delay_seconds" INTEGER NOT NULL DEFAULT 5,
    "title" TEXT NOT NULL DEFAULT 'Something is coming...',
    "description" TEXT NOT NULL DEFAULT 'Be among the first to receive updates about the next Level Up event.',
    "button_text" TEXT NOT NULL DEFAULT 'Join the list',
    "event_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communication_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_communication_leads" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "subscriber_id" TEXT,
    "source" TEXT NOT NULL DEFAULT 'event_communication_popup',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_communication_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_campaigns" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preview_text" TEXT,
    "title_text" TEXT,
    "body_content" TEXT NOT NULL,
    "header_image_url" TEXT,
    "campaign_image_url" TEXT,
    "cta_label" TEXT,
    "cta_url" TEXT,
    "footer_note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sent_at" TIMESTAMP(3),
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "activity_domain" TEXT NOT NULL,
    "motivation" TEXT,
    "help_domains" TEXT NOT NULL,
    "application_status" TEXT NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "membership_fee_paid" BOOLEAN NOT NULL DEFAULT false,
    "last_payment_date" TIMESTAMP(3),
    "consent_given" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

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
    "slot" TEXT NOT NULL DEFAULT 'hero',
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

-- CreateTable
CREATE TABLE "site_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "header_logo_url" TEXT,
    "header_join_label_fr" TEXT,
    "header_join_label_de" TEXT,
    "header_join_label_en" TEXT,
    "header_join_link" TEXT,
    "header_join_open_in_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "header_join_color_variant" TEXT DEFAULT 'red',
    "header_join_is_active" BOOLEAN NOT NULL DEFAULT true,
    "header_sponsor_color_variant" TEXT DEFAULT 'yellow',
    "header_sponsor_label_fr" TEXT,
    "header_sponsor_label_de" TEXT,
    "header_sponsor_label_en" TEXT,
    "header_sponsor_link" TEXT,
    "header_sponsor_open_in_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "header_sponsor_is_active" BOOLEAN NOT NULL DEFAULT true,
    "membership_hero_heading_fr" TEXT,
    "membership_hero_heading_de" TEXT,
    "membership_hero_heading_en" TEXT,
    "membership_hero_sub_fr" TEXT,
    "membership_hero_sub_de" TEXT,
    "membership_hero_sub_en" TEXT,
    "membership_hero_bg_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "coverImage" TEXT,
    "author" TEXT NOT NULL DEFAULT '├ëquipe Level Up in Germany',
    "category" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleDe" TEXT DEFAULT '',
    "roleEn" TEXT DEFAULT '',
    "roleFr" TEXT DEFAULT '',
    "bioDe" TEXT DEFAULT '',
    "bioEn" TEXT DEFAULT '',
    "bioFr" TEXT DEFAULT '',
    "linkedin" TEXT DEFAULT '',
    "imageUrl" TEXT DEFAULT '',

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'general',
    "size" INTEGER,
    "mimeType" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL DEFAULT '',
    "website_url" TEXT,
    "category" TEXT NOT NULL DEFAULT 'partner',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "postalCode" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "googleMapsUrl" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_translations" (
    "id" TEXT NOT NULL,
    "venue_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "display_name" TEXT DEFAULT '',
    "address_label" TEXT DEFAULT '',
    "city_label" TEXT DEFAULT '',
    "short_description" TEXT DEFAULT '',

    CONSTRAINT "venue_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
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
    "published_at" TIMESTAMP(3),
    "venue_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_translations" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "event_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_prices" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price_cents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "purchase_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_highlights" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_highlight_translations" (
    "id" TEXT NOT NULL,
    "event_highlight_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT DEFAULT '',

    CONSTRAINT "event_highlight_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_price_translations" (
    "id" TEXT NOT NULL,
    "event_price_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "info_text" TEXT DEFAULT '',

    CONSTRAINT "event_price_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_sections" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_section_translations" (
    "id" TEXT NOT NULL,
    "schedule_section_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT DEFAULT '',

    CONSTRAINT "schedule_section_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_items" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "section_id" TEXT,
    "start_time" TEXT,
    "end_time" TEXT,
    "block_type" TEXT DEFAULT 'morning',
    "session_type" TEXT NOT NULL DEFAULT 'other',
    "room" TEXT DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_item_translations" (
    "id" TEXT NOT NULL,
    "schedule_item_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT DEFAULT '',
    "description" TEXT DEFAULT '',

    CONSTRAINT "schedule_item_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speakers" (
    "id" TEXT NOT NULL,
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
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speaker_translations" (
    "id" TEXT NOT NULL,
    "speaker_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "role" TEXT DEFAULT '',
    "organization" TEXT DEFAULT '',
    "short_bio" TEXT DEFAULT '',
    "long_bio" TEXT DEFAULT '',

    CONSTRAINT "speaker_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_speakers" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "speaker_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_item_speakers" (
    "id" TEXT NOT NULL,
    "schedule_item_id" TEXT NOT NULL,
    "speaker_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "schedule_item_speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'partner',
    "logo_url" TEXT,
    "website_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_translations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "short_description" TEXT DEFAULT '',

    CONSTRAINT "organization_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_organizations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'partner',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_media" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'gallery',
    "url" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_media_translations" (
    "id" TEXT NOT NULL,
    "event_media_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "alt_text" TEXT DEFAULT '',
    "caption" TEXT DEFAULT '',

    CONSTRAINT "event_media_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_documents" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'event_book',
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_document_translations" (
    "id" TEXT NOT NULL,
    "event_document_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT DEFAULT '',

    CONSTRAINT "event_document_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_unsubscribe_token_key" ON "newsletter_subscribers"("unsubscribe_token");

-- CreateIndex
CREATE UNIQUE INDEX "communication_settings_event_id_key" ON "communication_settings"("event_id");

-- CreateIndex
CREATE INDEX "event_communication_leads_subscriber_id_idx" ON "event_communication_leads"("subscriber_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_communication_leads_event_id_email_key" ON "event_communication_leads"("event_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE INDEX "hero_slides_is_active_sort_order_idx" ON "hero_slides"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "home_buttons_is_active_display_order_idx" ON "home_buttons"("is_active", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "home_buttons_slot_key" ON "home_buttons"("slot");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_name_key" ON "team_members"("name");

-- CreateIndex
CREATE INDEX "partners_visible_sort_order_idx" ON "partners"("visible", "sort_order");

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

-- AddForeignKey
ALTER TABLE "communication_settings" ADD CONSTRAINT "communication_settings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_communication_leads" ADD CONSTRAINT "event_communication_leads_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_communication_leads" ADD CONSTRAINT "event_communication_leads_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "newsletter_subscribers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_translations" ADD CONSTRAINT "venue_translations_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_translations" ADD CONSTRAINT "event_translations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_prices" ADD CONSTRAINT "event_prices_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_highlights" ADD CONSTRAINT "event_highlights_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_highlight_translations" ADD CONSTRAINT "event_highlight_translations_event_highlight_id_fkey" FOREIGN KEY ("event_highlight_id") REFERENCES "event_highlights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_price_translations" ADD CONSTRAINT "event_price_translations_event_price_id_fkey" FOREIGN KEY ("event_price_id") REFERENCES "event_prices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_sections" ADD CONSTRAINT "schedule_sections_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_section_translations" ADD CONSTRAINT "schedule_section_translations_schedule_section_id_fkey" FOREIGN KEY ("schedule_section_id") REFERENCES "schedule_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "schedule_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item_translations" ADD CONSTRAINT "schedule_item_translations_schedule_item_id_fkey" FOREIGN KEY ("schedule_item_id") REFERENCES "schedule_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speaker_translations" ADD CONSTRAINT "speaker_translations_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "speakers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "speakers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item_speakers" ADD CONSTRAINT "schedule_item_speakers_schedule_item_id_fkey" FOREIGN KEY ("schedule_item_id") REFERENCES "schedule_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item_speakers" ADD CONSTRAINT "schedule_item_speakers_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "speakers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_translations" ADD CONSTRAINT "organization_translations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_organizations" ADD CONSTRAINT "event_organizations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_organizations" ADD CONSTRAINT "event_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_media" ADD CONSTRAINT "event_media_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_media_translations" ADD CONSTRAINT "event_media_translations_event_media_id_fkey" FOREIGN KEY ("event_media_id") REFERENCES "event_media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_documents" ADD CONSTRAINT "event_documents_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_document_translations" ADD CONSTRAINT "event_document_translations_event_document_id_fkey" FOREIGN KEY ("event_document_id") REFERENCES "event_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

