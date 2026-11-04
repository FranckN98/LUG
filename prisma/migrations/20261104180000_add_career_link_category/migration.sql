INSERT INTO "social_link_categories" ("id", "name", "sort_order", "updated_at")
SELECT 'links-career-tour', 'Level Up Career Tour', 3, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "social_link_categories" WHERE "name" = 'Level Up Career Tour'
);

UPDATE "social_links"
SET "category_id" = 'links-career-tour'
WHERE "category_id" IS NULL
  AND lower("title" || ' ' || "url" || ' ' || coalesce("description", '')) ~ 'career|job|emploi|recrut|carriere';
