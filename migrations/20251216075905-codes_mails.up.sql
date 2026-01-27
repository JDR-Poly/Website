 ----- MEMBERSHIP 2025 CODE TABLE -----

CREATE TYPE semester AS ENUM ('autumn', 'spring', 'all');

CREATE TABLE public.membership_code(
    id SERIAL PRIMARY KEY NOT NULL,
	validation_token VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    period semester NOT NULL,
	year INTEGER NOT NULL,
    email_sent TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.membership(
    user_id INT NOT NULL,
    period semester NOT NULL,
	year INTEGER NOT NULL,
    date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    from_code BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- This trigger merges memberships if in the same year but not overlapping
CREATE OR REPLACE FUNCTION membership_extend_trigger()
RETURNS TRIGGER AS
$$
DECLARE
    s semester;
BEGIN
    IF NEW.period <> 'all'
    THEN
        SELECT period INTO s FROM membership WHERE NEW.user_id = user_id AND NEW.year = year AND period <> 'all';
        IF s IS NOT NULL AND s <> NEW.period
        THEN
            DELETE FROM membership WHERE NEW.user_id = user_id AND NEW.year = year;
            NEW.period := 'all';
        END IF;
    END IF;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER membership_extend
BEFORE INSERT
ON membership FOR EACH ROW
WHEN ( TRUE )
EXECUTE FUNCTION membership_extend_trigger();

-- This function returns start date for a given year and semester
CREATE OR REPLACE FUNCTION semester_start(s semester, year INTEGER)
RETURNS DATE AS
$$
DECLARE
    start_date DATE;
BEGIN
    IF s = 'spring'
    THEN
        start_date := MAKE_DATE(year + 1, 1, 1);
    ELSE
        start_date := MAKE_DATE(year, 8, 1);
    END IF;
    RETURN start_date;
END;
$$
LANGUAGE plpgsql;

-- This function returns end date for a given year and semester
CREATE OR REPLACE FUNCTION semester_end(s semester, year INTEGER)
RETURNS DATE AS
$$
DECLARE
    end_date DATE;
BEGIN
    IF s = 'autumn'
    THEN
        end_date := MAKE_DATE(year + 1, 1, 31);
    ELSE
        end_date := MAKE_DATE(year + 1, 8, 31);
    END IF;
    RETURN end_date;
END;
$$
LANGUAGE plpgsql;

-- This function returns combines 2 date intervals
CREATE OR REPLACE FUNCTION combine_intervals(current DATE[2], other DATE[2])
RETURNS DATE[2] AS
$$
DECLARE
    interval DATE[2];
BEGIN
    IF current[1] IS NULL THEN
        RETURN other;
    END IF;
    IF other[1] IS NULL OR (other[1] > current[2]) 
        OR (other[2] < current[1]) 
    THEN
        RETURN current;
    END IF;
    interval[1] := LEAST(current[1], other[1]);
    interval[2] := GREATEST(current[2], other[2]);
    RETURN interval;
END;
$$
LANGUAGE plpgsql;

CREATE AGGREGATE sum_membership (DATE[2])
(
    sfunc = combine_intervals,
    stype = DATE[2],
    initcond = '{NULL,NULL}'
);

CREATE VIEW users_memberships_view AS
WITH md AS (
    SELECT user_id
    , semester_start(period, year) as sdate
    , semester_end(period, year) as edate
    FROM membership
    WHERE semester_end(period, year) >= CURRENT_DATE
)
SELECT id
, email
, is_email_validated
, name
, password
, role
, account_creation
, discord_id
, discord_username
, (combine_intervals(
    ARRAY[u.member_start, u.member_stop],
    (sum_membership(ARRAY[md.sdate, md.edate] ORDER BY md.sdate))
 ))[1] AS member_start
, (combine_intervals(
    ARRAY[u.member_start, u.member_stop],
    (sum_membership(ARRAY[md.sdate, md.edate] ORDER BY md.sdate))
 ))[2] AS member_stop
FROM users u
LEFT JOIN md
    ON md.user_id = u.id
GROUP BY id;
