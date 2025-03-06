<!-- @format -->

# JDRPolyWeb

The goal of this project, it to create a new website for JDR-Poly : a commission of the AGEPoly. AGEPoly is an association of the EPFL

## Framework and technologies

This website works using Sveltekit (an application framework powered by Svelte and Vite)

The main language used is TypeScript, and the database is a **Postgresql database**

## How to help

1. Create a postgresql database
2. Clone the project and run `npm install`
3. Create .env file with all the appropriates settings

```
BODY_SIZE_LIMIT=Infinity
DB_IP=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
TURNSTILE_SECRET="1x0000000000000000000000000000000AA"
PUBLIC_DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
PUBLIC_DISCORD_REDIRECT_URI=
```

`In a DEV environment, MAIL_HOST, MAIL_PORT, MAIL_USER and MAIL_PASSWORD are optional`
`TURNSTILE_SECRET is the secret for cloudflare turnstile`

4. Manually run the migration using `npm run migrator up`
5. Run using `npm run dev`

## How to build and run

1. run `npm run build`
2. (Optional) edit .env
3. Serve with `npm run start` (or `npm run start -- --http` if you don't want https)

https use express server under the hood (https://kit.svelte.dev/docs/adapter-node#custom-server),
you will need to modify server.js to set your own certificate.
