-- Creates isolated app schemas per deployment environment.
-- The public schema is left untouched (Supabase auth lives there).
-- Each schema is populated by Prisma migrations via DATABASE_URL?schema=<env>.

CREATE SCHEMA IF NOT EXISTS dev;
CREATE SCHEMA IF NOT EXISTS qa;
CREATE SCHEMA IF NOT EXISTS production;
CREATE SCHEMA IF NOT EXISTS preview;

-- postgres role is a superuser in Supabase and already owns these schemas,
-- but explicit grants make the intent clear and survive role resets.
GRANT ALL PRIVILEGES ON SCHEMA dev        TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA qa         TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA production TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA preview    TO postgres;

-- Allow PostgREST to route requests into these schemas if they are later
-- added to the "Exposed schemas" list in the Supabase dashboard.
GRANT USAGE ON SCHEMA dev        TO authenticated, anon;
GRANT USAGE ON SCHEMA qa         TO authenticated, anon;
GRANT USAGE ON SCHEMA production TO authenticated, anon;
GRANT USAGE ON SCHEMA preview    TO authenticated, anon;
