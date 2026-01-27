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
