-- DropIndex
DROP INDEX "User_user_role_key";

-- CreateTable
CREATE TABLE "CompanyMaster" (
    "company_id" SERIAL NOT NULL,
    "company_name" TEXT NOT NULL,
    "logo" TEXT,
    "favicon" TEXT,
    "contact_email" TEXT NOT NULL,
    "contact_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMaster_pkey" PRIMARY KEY ("company_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMaster_contact_email_key" ON "CompanyMaster"("contact_email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "CompanyMaster"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriberManagement" ADD CONSTRAINT "SubscriberManagement_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "CompanyMaster"("company_id") ON DELETE SET NULL ON UPDATE CASCADE;
