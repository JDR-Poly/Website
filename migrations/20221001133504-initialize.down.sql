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

-- 3. DROP VIEWS
DROP VIEW public.users_memberships_view;

-- 4. DROP FUNCTIONS
DROP AGGREGATE  public.sum_membership;
DROP FUNCTION   public.combine_intervals;
DROP FUNCTION   public.semester_end;
DROP FUNCTION   public.semester_start;
DROP TRIGGER    public.membership_extend;
DROP FUNCTION   public.membership_extend_trigger;

-- 5. DROP TABLES --
DROP TABLE public.users;
DROP TABLE public.sessions;
DROP TABLE public.email_validation;
DROP TABLE public.members_code;
DROP TABLE public.events;
DROP TABLE public.event_inscription;
DROP TABLE public.committee_info;
DROP TABLE public.books;
DROP TABLE public.honor_members;
DROP TABLE public.membership_code;
DROP TABLE public.membership;
DROP TABLE public.global_settings;

DROP TYPE public.semester;
