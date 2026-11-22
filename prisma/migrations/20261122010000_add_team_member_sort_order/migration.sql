-- Add team member display ordering
ALTER TABLE "team_members" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Initialize existing members in a stable order
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "name") * 10 AS rn
  FROM "team_members"
)
UPDATE "team_members"
SET "sortOrder" = ranked.rn
FROM ranked
WHERE "team_members"."id" = ranked."id";
