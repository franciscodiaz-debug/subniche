-- ============================================================
-- Migration: code, email_verification_tokens, drop display_name
-- ============================================================

-- 1. Drop display_name from users
ALTER TABLE "users" DROP COLUMN IF EXISTS "display_name";

-- 2. Add code (nullable first so existing rows don't fail)
ALTER TABLE "users" ADD COLUMN "code" VARCHAR(15);
ALTER TABLE "users" ADD COLUMN "code_updated_at" TIMESTAMPTZ;

-- 3. Backfill existing rows with a deterministic 6-char code derived from the row id
UPDATE "users"
SET "code" = UPPER(SUBSTRING(MD5(id::TEXT) FROM 1 FOR 15));

-- 4. Make code NOT NULL and unique
ALTER TABLE "users" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_code_key" UNIQUE ("code");

-- 5. Create email_verification_tokens table
CREATE TABLE "email_verification_tokens" (
  "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
  "email"       VARCHAR(255) NOT NULL,
  "token_hash"  VARCHAR(255) NOT NULL,
  "expires_at"  TIMESTAMPTZ NOT NULL,
  "verified_at" TIMESTAMPTZ,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "email_verification_tokens_token_hash_key" UNIQUE ("token_hash")
);
