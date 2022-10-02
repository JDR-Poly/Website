-- 1. DROP FOREIGN KEYS --
ALTER TABLE IF EXISTS public.events DROP CONSTRAINT IF EXISTS author_fk;
ALTER TABLE IF EXISTS public.event_inscription DROP CONSTRAINT IF EXISTS user_id_fk;
ALTER TABLE IF EXISTS public.event_inscription DROP CONSTRAINT IF EXISTS event_id_fk;
-- 2. DROP OTHER CONSTRAINTS --
ALTER TABLE IF EXISTS public.events DROP CONSTRAINT IF EXISTS events_pk;
ALTER TABLE IF EXISTS public.event_inscription DROP CONSTRAINT IF EXISTS event_inscription_pk;
-- 3. DROP TABLES --
DROP TABLE public.users;
DROP TABLE public.cookies;
DROP TABLE public.email_validation;
DROP TABLE public.members_code;
DROP TABLE public.events;
DROP TABLE public.event_inscription;