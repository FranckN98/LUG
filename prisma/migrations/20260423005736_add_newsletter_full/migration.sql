-- CreateTable
CREATE TABLE "newsletter_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "preview_text" TEXT,
    "title_text" TEXT,
    "body_content" TEXT NOT NULL,
    "cta_label" TEXT,
    "cta_url" TEXT,
    "footer_note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sent_at" DATETIME,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_newsletter_subscribers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "tags" TEXT DEFAULT 'levelup_event',
    "first_name" TEXT,
    "last_name" TEXT,
    "address" TEXT,
    "city" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "unsubscribe_token" TEXT
);
INSERT INTO "new_newsletter_subscribers" ("consent", "created_at", "email", "id", "name", "source", "tags") SELECT "consent", "created_at", "email", "id", "name", "source", "tags" FROM "newsletter_subscribers";
DROP TABLE "newsletter_subscribers";
ALTER TABLE "new_newsletter_subscribers" RENAME TO "newsletter_subscribers";
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");
CREATE UNIQUE INDEX "newsletter_subscribers_unsubscribe_token_key" ON "newsletter_subscribers"("unsubscribe_token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
