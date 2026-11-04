INSERT INTO "social_link_categories" ("id", "name", "sort_order", "updated_at")
SELECT 'links-partner', 'Partenaire', 4, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "social_link_categories" WHERE "name" = 'Partenaire'
);

UPDATE "social_link_categories"
SET "sort_order" = 5
WHERE "name" = 'Communauté';

UPDATE "social_links"
SET "category_id" = 'links-partner'
WHERE lower("title" || ' ' || "url" || ' ' || coalesce("description", '')) LIKE '%lemfi%';