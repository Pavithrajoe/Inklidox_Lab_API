-- CreateTable
CREATE TABLE "SubscriberManagement" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "subscriber_email" TEXT NOT NULL,
    "subscription_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SubscriberManagement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriberManagement_subscriber_email_key" ON "SubscriberManagement"("subscriber_email");
