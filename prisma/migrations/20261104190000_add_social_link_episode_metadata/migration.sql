ALTER TABLE "social_links"
  ADD COLUMN IF NOT EXISTS "episode_number" INTEGER,
  ADD COLUMN IF NOT EXISTS "badge" TEXT;

WITH ranked_business_links AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "sort_order" ASC, "created_at" ASC) AS "episode_number"
  FROM "social_links"
  WHERE "category_id" = 'links-business-tour'
    AND "episode_number" IS NULL
)
UPDATE "social_links" AS links
SET "episode_number" = ranked."episode_number"
FROM ranked_business_links AS ranked
WHERE links."id" = ranked."id";