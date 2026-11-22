-- CreateTable
CREATE TABLE "team_categories" (
    "id" TEXT NOT NULL,
    "nameDe" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "team_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TeamCategoryToTeamMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TeamCategoryToTeamMember_AB_unique" ON "_TeamCategoryToTeamMember"("A", "B");

-- CreateIndex
CREATE INDEX "_TeamCategoryToTeamMember_B_index" ON "_TeamCategoryToTeamMember"("B");

-- AddForeignKey
ALTER TABLE "_TeamCategoryToTeamMember" ADD CONSTRAINT "_TeamCategoryToTeamMember_A_fkey" FOREIGN KEY ("A") REFERENCES "team_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamCategoryToTeamMember" ADD CONSTRAINT "_TeamCategoryToTeamMember_B_fkey" FOREIGN KEY ("B") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed the requested categories
INSERT INTO "team_categories" ("id", "nameDe", "nameEn", "nameFr", "sortOrder") VALUES
  ('team-board-management', 'Board Management', 'Board Management', 'Board Management', 10),
  ('team-it', 'IT', 'IT', 'IT', 20),
  ('team-finance', 'Finanzen', 'Finance', 'Finance', 30),
  ('team-business-tour', 'Level Up Business Tour', 'Level Up Business Tour', 'Level Up Business Tour', 40),
  ('team-fundraising', 'Fundraising & Partnerschaften', 'Fundraising & Partnerships', 'Levée de fonds & partenariats', 50);
