CREATE TABLE "niche_profiles" (
  "id"           UUID          NOT NULL DEFAULT gen_random_uuid(),
  "user_id"      UUID          NOT NULL,
  "niche_id"     UUID          NOT NULL,
  "display_name" VARCHAR(50)   NOT NULL,
  "bio"          VARCHAR(1000),
  "created_at"   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updated_at"   TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT "niche_profiles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "niche_profiles_user_id_niche_id_key" UNIQUE ("user_id", "niche_id"),
  CONSTRAINT "niche_profiles_niche_id_display_name_key" UNIQUE ("niche_id", "display_name"),
  CONSTRAINT "niche_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "niche_profiles_niche_id_fkey" FOREIGN KEY ("niche_id") REFERENCES "niches"("id") ON DELETE CASCADE
);
