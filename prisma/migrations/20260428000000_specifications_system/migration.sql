-- AlterTable: add bitpos to categories
ALTER TABLE "categories" ADD COLUMN "bitpos" BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "categories_niche_id_bitpos_key" ON "categories"("niche_id", "bitpos");

-- Trigger: auto-assign bitpos as next power of 2 per niche for categories
CREATE OR REPLACE FUNCTION fn_category_bitpos()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bitpos := COALESCE(
        (SELECT MAX(bitpos) * 2 FROM categories WHERE niche_id = NEW.niche_id),
        1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_category_bitpos
BEFORE INSERT ON categories
FOR EACH ROW
EXECUTE FUNCTION fn_category_bitpos();

-- CreateTable
CREATE TABLE "specifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "niche_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(15) NOT NULL,
    "field_config" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specification_values" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "specification_id" UUID NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "bitpos" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specification_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specification_category_values" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL,
    "specification_value_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specification_category_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_specification_values" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "specification_id" UUID NOT NULL,
    "specification_category_value_id" UUID,
    "value" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_specification_values_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "listing_specification_values_chk" CHECK (
        (specification_category_value_id IS NOT NULL AND value IS NULL) OR
        (specification_category_value_id IS NULL AND value IS NOT NULL)
    )
);

-- CreateTable
CREATE TABLE "listing_spec_bitmasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "specification_id" UUID NOT NULL,
    "hash" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_spec_bitmasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_category_bitmasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "hash" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_category_bitmasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "specifications_niche_id_idx" ON "specifications"("niche_id");

-- CreateIndex
CREATE UNIQUE INDEX "specifications_niche_id_name_key" ON "specifications"("niche_id", "name");

-- CreateIndex
CREATE INDEX "specification_values_specification_id_idx" ON "specification_values"("specification_id");

-- CreateIndex
CREATE UNIQUE INDEX "specification_values_specification_id_bitpos_key" ON "specification_values"("specification_id", "bitpos");

-- CreateIndex
CREATE INDEX "specification_category_values_category_id_idx" ON "specification_category_values"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "specification_category_values_category_id_specification_value_id_key" ON "specification_category_values"("category_id", "specification_value_id");

-- CreateIndex
CREATE INDEX "listing_specification_values_listing_id_idx" ON "listing_specification_values"("listing_id");

-- CreateIndex
CREATE INDEX "listing_specification_values_specification_id_idx" ON "listing_specification_values"("specification_id");

-- CreateIndex
CREATE INDEX "listing_spec_bitmasks_listing_id_idx" ON "listing_spec_bitmasks"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "listing_spec_bitmasks_listing_id_specification_id_key" ON "listing_spec_bitmasks"("listing_id", "specification_id");

-- CreateIndex
CREATE UNIQUE INDEX "listing_category_bitmasks_listing_id_key" ON "listing_category_bitmasks"("listing_id");

-- AddForeignKey
ALTER TABLE "specifications" ADD CONSTRAINT "specifications_niche_id_fkey" FOREIGN KEY ("niche_id") REFERENCES "niches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specification_values" ADD CONSTRAINT "specification_values_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "specifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specification_category_values" ADD CONSTRAINT "specification_category_values_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specification_category_values" ADD CONSTRAINT "specification_category_values_specification_value_id_fkey" FOREIGN KEY ("specification_value_id") REFERENCES "specification_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_specification_values" ADD CONSTRAINT "listing_specification_values_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_specification_values" ADD CONSTRAINT "listing_specification_values_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "specifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_specification_values" ADD CONSTRAINT "listing_specification_values_specification_category_value_id_fkey" FOREIGN KEY ("specification_category_value_id") REFERENCES "specification_category_values"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_spec_bitmasks" ADD CONSTRAINT "listing_spec_bitmasks_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_spec_bitmasks" ADD CONSTRAINT "listing_spec_bitmasks_specification_id_fkey" FOREIGN KEY ("specification_id") REFERENCES "specifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_category_bitmasks" ADD CONSTRAINT "listing_category_bitmasks_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Trigger: auto-assign bitpos as next power of 2 per specification
CREATE OR REPLACE FUNCTION fn_specification_value_bitpos()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bitpos := COALESCE(
        (SELECT MAX(bitpos) * 2 FROM specification_values WHERE specification_id = NEW.specification_id),
        1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_specification_value_bitpos
BEFORE INSERT ON specification_values
FOR EACH ROW
EXECUTE FUNCTION fn_specification_value_bitpos();
