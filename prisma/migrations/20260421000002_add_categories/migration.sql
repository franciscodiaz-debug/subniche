CREATE TABLE "categories" (
  "id"         UUID         NOT NULL DEFAULT gen_random_uuid(),
  "title"      VARCHAR(255) NOT NULL,
  "slug"       VARCHAR(255) NOT NULL,
  "niche_id"   UUID         NOT NULL,
  "parent_id"  UUID,
  "order"      INTEGER      NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "categories_niche_id_fkey" FOREIGN KEY ("niche_id") REFERENCES "niches"("id") ON DELETE CASCADE,
  CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "categories_niche_id_slug_key" ON "categories"("niche_id", "slug");
CREATE INDEX "categories_niche_id_idx" ON "categories"("niche_id");
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_anon_read" ON "categories" FOR SELECT TO anon USING (true);
