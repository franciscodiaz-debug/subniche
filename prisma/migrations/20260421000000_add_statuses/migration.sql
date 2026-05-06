-- CreateTable
CREATE TABLE "statuses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(45) NOT NULL,
    "code" VARCHAR(45) NOT NULL,
    "icon" VARCHAR(45) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "statuses_code_key" ON "statuses"("code");

-- Seed
INSERT INTO "statuses" ("name", "code", "icon") VALUES
('For Sale', 'for-sale', 'dollar-sign'),
('For Trade', 'for-trade', 'arrow-left-right'),
('In Collection', 'in-collection', 'folder-open'),
('Wishlist', 'wishlist', 'heart');

ALTER TABLE "statuses"  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "statuses: anon read-only"
  ON "statuses"
  FOR SELECT
  TO anon
  USING (true);