-- AlterTable
ALTER TABLE "SubscriberManagement" ALTER COLUMN "company_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "user_name" TEXT NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "user_role" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_role_name_key" ON "Roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_email_key" ON "User"("user_email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_role_fkey" FOREIGN KEY ("user_role") REFERENCES "Roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;
