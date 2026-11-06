CREATE TABLE IF NOT EXISTS "feedback_responses" (
    "id" TEXT NOT NULL,
    "submitted_on" DATE NOT NULL,
    "rating" INTEGER NOT NULL,
    "highlights" TEXT,
    "likes_and_improvements" TEXT,
    "wanted_speakers" TEXT,
    "wanted_topics" TEXT,
    "is_signed" BOOLEAN NOT NULL DEFAULT false,
    "first_name" TEXT,
    "last_name" TEXT,
    CONSTRAINT "feedback_responses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "feedback_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "feedback_tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "feedback_news_signups" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    CONSTRAINT "feedback_news_signups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "_FeedbackResponseToFeedbackTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "feedback_tags_name_key" ON "feedback_tags"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "feedback_news_signups_email_key" ON "feedback_news_signups"("email");
CREATE INDEX IF NOT EXISTS "feedback_responses_submitted_on_idx" ON "feedback_responses"("submitted_on");
CREATE INDEX IF NOT EXISTS "feedback_responses_rating_idx" ON "feedback_responses"("rating");
CREATE UNIQUE INDEX IF NOT EXISTS "_FeedbackResponseToFeedbackTag_AB_unique" ON "_FeedbackResponseToFeedbackTag"("A", "B");
CREATE INDEX IF NOT EXISTS "_FeedbackResponseToFeedbackTag_B_index" ON "_FeedbackResponseToFeedbackTag"("B");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'feedback_response_tag_response_fkey') THEN
    ALTER TABLE "_FeedbackResponseToFeedbackTag"
      ADD CONSTRAINT "feedback_response_tag_response_fkey"
      FOREIGN KEY ("A") REFERENCES "feedback_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'feedback_response_tag_tag_fkey') THEN
    ALTER TABLE "_FeedbackResponseToFeedbackTag"
      ADD CONSTRAINT "feedback_response_tag_tag_fkey"
      FOREIGN KEY ("B") REFERENCES "feedback_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
