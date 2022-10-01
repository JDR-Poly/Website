----- USERS TABLE -----

CREATE TABLE public.users(
	id SERIAL PRIMARY KEY,
	email VARCHAR(255) NOT NULL,
	is_email_validated BOOLEAN NOT NULL,
	name VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
	role VARCHAR(255) NOT NULL,
	account_creation DATE NOT NULL DEFAULT CURRENT_DATE,
	discord_id VARCHAR(255),
	avatar_id VARCHAR(50),
	bio TEXT,
	member_start DATE,
	member_stop DATE
)

----- COOKIES TABLE -----

CREATE TABLE public.cookies(
	email VARCHAR(255) PRIMARY KEY NOT NULL,
	cookieId VARCHAR(255) NOT NULL
)

----- EMAIL VALIDATION CODE TABLE -----

CREATE TABLE public.email_validation(
	id INT PRIMARY KEY NOT NULL,
	validation_token VARCHAR(255) NOT NULL
)

----- MEMBER CODE TABLE -----

CREATE TABLE public.members_code(
	validation_token VARCHAR(255) PRIMARY KEY NOT NULL,
	periods INT NOT NULL,
	code_creation DATE NOT NULL DEFAULT CURRENT_DATE
)