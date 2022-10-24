-- 1. DROP FOREIGN KEYS --
ALTER TABLE IF EXISTS public.sessions DROP CONSTRAINT IF EXISTS user_id_fk;
ALTER TABLE IF EXISTS public.events DROP CONSTRAINT IF EXISTS author_fk;
ALTER TABLE IF EXISTS public.event_inscription DROP CONSTRAINT IF EXISTS user_id_fk;
ALTER TABLE IF EXISTS public.event_inscription DROP CONSTRAINT IF EXISTS event_id_fk;
-- 2. DROP OTHER CONSTRAINTS --
ALTER TABLE IF EXISTS public.sessions DROP CONSTRAINT IF EXISTS cookieId_pk;
ALTER TABLE IF EXISTS public.events DROP CONSTRAINT IF EXISTS events_pk;
ALTER TABLE IF EXISTS public.event_inscription DROP CONSTRAINT IF EXISTS event_inscription_pk;
ALTER TABLE IF EXISTS public.committee_info DROP CONSTRAINT IF EXISTS id_pk;

-- 3. DROP TABLES --
DROP TABLE public.users;
DROP TABLE public.sessions;
DROP TABLE public.email_validation;
DROP TABLE public.members_code;
DROP TABLE public.events;
DROP TABLE public.event_inscription;
DROP TABLE public.committee_info;
