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

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");
