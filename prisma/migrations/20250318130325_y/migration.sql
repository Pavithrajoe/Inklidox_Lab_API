/*
  Warnings:

  - A unique constraint covering the columns `[user_role]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_user_role_key" ON "User"("user_role");
