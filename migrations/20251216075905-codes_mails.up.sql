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
