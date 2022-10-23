# JDRPolyWeb
The goal of this project, it to create a new website for JDRPoly : a commission of the AGEPoly. AGEPoly is an association of the EPFL

## Framework and technologies
This website works using Sveltekit (an application framework powered by Svelte and Vite)

The main language used is TypeScript, and the database is a **Postgresql database** 

## How to help
1. Create a postgresql database
2. Clone the project
3. Run `npm install` in the project folder (you need to have nodejs and npm installed)
4. Create a .env file and fill these information :
```
DB_IP=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
```
`In a DEV environment, MAIL_HOST, MAIL_PORT, MAIL_USER and MAIL_PASSWORD are optional`

5. Run initialize-up migration file in your postgresql database
6. Run using `npm run dev`


## Additionals informations

### Adding smui packages : 
If you add a smui package, you need to run `npm run prepare` after having added the smui package