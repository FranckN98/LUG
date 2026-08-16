-- CreateTable
CREATE TABLE "social_link_translations" (
    "id" TEXT NOT NULL,
    "social_link_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_link_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "social_link_translations_locale_idx" ON "social_link_translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "social_link_translations_social_link_id_locale_key" ON "social_link_translations"("social_link_id", "locale");

-- AddForeignKey
ALTER TABLE "social_link_translations" ADD CONSTRAINT "social_link_translations_social_link_id_fkey" FOREIGN KEY ("social_link_id") REFERENCES "social_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
