-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'admin', 'member');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'member';

-- SeedData: superadmin users
INSERT INTO "users" ("first_name", "last_name", "display_name", "email", "role")
VALUES
  ('Kyle',  'Kaiser',   'kyle_kaise',        'KyleJKaiser@gmail.com',         'superadmin'),
  ('Walde', 'Raimundo', 'waldemar_raimundo',  'waldemar.krumrick@darwoft.com', 'superadmin')
ON CONFLICT ("email") DO UPDATE SET "role" = 'superadmin';

-- SeedData: password identities for superadmin users (provider=auth0, scrypt hash of "P@$$w0rd")
INSERT INTO "user_identities" ("user_id", "provider", "identify_name", "identify_value", "password_hash")
SELECT "id", 'auth0', 'email', "email", '9a2dc05b11806c84478de03a33993d27:eee3ee784685b6e87a54adc417c29562d42c507588413cec80faa0e0184dfe7512ba08a284af7a0d8834dae97bd1604e509e830d600ba128189430879211438e'
FROM "users"
WHERE "email" IN ('KyleJKaiser@gmail.com', 'waldemar.krumrick@darwoft.com')
ON CONFLICT DO NOTHING;
