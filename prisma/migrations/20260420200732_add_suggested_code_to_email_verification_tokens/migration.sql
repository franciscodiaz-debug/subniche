-- AlterTable
ALTER TABLE "email_verification_tokens" ADD COLUMN "suggested_code" VARCHAR(15) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_suggested_code_key" ON "email_verification_tokens"("suggested_code");
