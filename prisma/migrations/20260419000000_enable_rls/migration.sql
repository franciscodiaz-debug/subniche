-- ============================================================
-- Migration: Enable Row Level Security on all tables
-- ============================================================
-- Context: The application connects via the `postgres` superuser
-- through Prisma, which bypasses RLS automatically (superusers
-- always bypass RLS in PostgreSQL). These policies protect against
-- direct access through Supabase's PostgREST API using the `anon`
-- or `authenticated` roles.
--
-- Table classification:
--   PUBLIC  → niches, locations, examples   (read-only for anon)
--   PRIVATE → users, user_identities,
--             email_verification_tokens     (no direct access)
-- ============================================================

-- ── Enable RLS on every table ────────────────────────────────

ALTER TABLE "niches"                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "locations"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "examples"                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users"                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_identities"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "email_verification_tokens"  ENABLE ROW LEVEL SECURITY;

-- ── Public read-only tables ───────────────────────────────────
-- Reference/catalog data. Allow SELECT for the anon role.
-- All INSERT / UPDATE / DELETE go through the API (Prisma).

CREATE POLICY "niches: anon read-only"
  ON "niches"
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "locations: anon read-only"
  ON "locations"
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "examples: anon read-only"
  ON "examples"
  FOR SELECT
  TO anon
  USING (true);

-- ── Private tables: default-deny ─────────────────────────────
-- No policies are created for users, user_identities, or
-- email_verification_tokens. With RLS enabled and no matching
-- policy, PostgreSQL denies all access for anon and authenticated
-- roles. Only the postgres superuser (Prisma) can read/write them.

-- ── Convention for new tables ──────────────────────────────────
-- Every new table added in a future migration MUST include:
--   ALTER TABLE "new_table" ENABLE ROW LEVEL SECURITY;
-- followed by appropriate policies:
--   - Public catalog/read-only data → anon SELECT policy (like niches)
--   - User-owned data → authenticated SELECT/INSERT/UPDATE/DELETE policies
--   - Internal-only data → no policy (default-deny, like users)
