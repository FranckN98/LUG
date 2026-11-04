ALTER TABLE "social_links" ADD COLUMN "is_discoverable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "social_links" ADD COLUMN "category_id" TEXT;

CREATE TABLE "social_link_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "social_link_categories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "social_link_categories_sort_order_idx" ON "social_link_categories"("sort_order");
CREATE INDEX "social_links_category_id_sort_order_idx" ON "social_links"("category_id", "sort_order");
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "social_link_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "social_link_categories" ("id", "name", "sort_order", "updated_at") VALUES
  ('links-business-tools', 'Level Up Business Tools', 0, CURRENT_TIMESTAMP),
  ('links-events', 'Événements Level Up', 1, CURRENT_TIMESTAMP),
  ('links-business-tour', 'Level Up Business Tour', 2, CURRENT_TIMESTAMP),
  ('links-community', 'Communauté', 3, CURRENT_TIMESTAMP);

UPDATE "social_links"
SET "category_id" = CASE
  WHEN lower("title" || ' ' || "url" || ' ' || coalesce("description", '')) ~ 'business|outil|tool' THEN 'links-business-tools'
  WHEN lower("title" || ' ' || "url" || ' ' || coalesce("description", '')) ~ 'event|événement|conference|ticket|billet' THEN 'links-events'
  WHEN lower("title" || ' ' || "url" || ' ' || coalesce("description", '')) ~ 'tour|entrepreneur|business' THEN 'links-business-tour'
  ELSE 'links-community'
END
WHERE "is_featured" = false;