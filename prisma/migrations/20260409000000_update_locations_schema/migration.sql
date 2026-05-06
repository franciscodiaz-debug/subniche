-- AlterTable locations: replace old schema with full location fields
ALTER TABLE "locations" DROP COLUMN IF EXISTS "name";
ALTER TABLE "locations" DROP COLUMN IF EXISTS "country";

ALTER TABLE "locations"
    ADD COLUMN "country"      VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN "country_code" VARCHAR(3)   NOT NULL DEFAULT '',
    ADD COLUMN "state"        VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN "state_code"   VARCHAR(3)   NOT NULL DEFAULT '',
    ADD COLUMN "capital"      VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN "city"         VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN "city_code"    VARCHAR(8)   NOT NULL DEFAULT '',
    ADD COLUMN "zip_code"     VARCHAR(10)  NOT NULL DEFAULT '',
    ADD COLUMN "latitude"     DECIMAL(10,8) NOT NULL DEFAULT 0,
    ADD COLUMN "longitude"    DECIMAL(11,8) NOT NULL DEFAULT 0;

-- Drop defaults once columns are added (they exist only to satisfy NOT NULL during ALTER)
ALTER TABLE "locations"
    ALTER COLUMN "country"      DROP DEFAULT,
    ALTER COLUMN "country_code" DROP DEFAULT,
    ALTER COLUMN "state"        DROP DEFAULT,
    ALTER COLUMN "state_code"   DROP DEFAULT,
    ALTER COLUMN "capital"      DROP DEFAULT,
    ALTER COLUMN "city"         DROP DEFAULT,
    ALTER COLUMN "city_code"    DROP DEFAULT,
    ALTER COLUMN "zip_code"     DROP DEFAULT,
    ALTER COLUMN "latitude"     DROP DEFAULT,
    ALTER COLUMN "longitude"    DROP DEFAULT;
