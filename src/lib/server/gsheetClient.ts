/** @format */

import { env } from "$env/dynamic/private";
import { schedule } from "node-cron";
import { logger } from "./logger";
import { building } from "$app/environment";
import { google } from "googleapis";

//The !building trick prevent call to env ($env/dynamic/private) while doing prerendering, thus preventing a crash.
const auth_options = !building
    ? {
            email: env.GSHEETS_EMAIL,
            key: env.GSHEETS_KEY,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"]
        }
    : {
            email: "<placeholder>",
            key: "<placeholder>",
            scopes: ["https://www.googleapis.com/auth/spreadsheets"]
        };
const auth = new google.auth.JWT(auth_options);

const gsheet = google.sheets({ version: "v4", auth: auth});

const spreadsheetId = !building ? env.GSHEETS_ID : "<none>";

async function send_member_codes() {
    // Are we in start or end of year
	const now = new Date(Date.now());
	const is_first_year_half: boolean = now.getMonth() <= 6;
    const year = now.getFullYear() + (is_first_year_half ? -1 : 0);

    let result = await gsheet.spreadsheets.values.get({
        spreadsheetId,
        range: "C:G"
    }).catch(() => {
        logger.warning("Could not get code data from spreadsheet");
        return Error("");
    });

    if (result instanceof Error || !result.data.values)
        return 0;
    let update_ranges: any[] = [];

    for (let i = 0; i < result.data.values.length; i++) {
        if (result.data.values[i].length === 5) {
            const email = result.data.values[i][0];
            const code_status = result.data.values[i][4];
            const s1 = result.data.values[i][2] === 'oui';
            const s2 = result.data.values[i][3] === 'oui';
            if (!s1 && !s2)
                continue;
            const semester = s1 ? (s2 ? 'all' : 'autumn') : 'spring';
            const range = `G${i+1}`
            if (code_status === 'non') {
                logger.info(`Sent code to ${email} for ${semester} ${year}`);
                //TODO send code if needed
                update_ranges.push({
                    range: range,
                    values: [['oui']]
                })
            }
        }
    }

    const resource = {
        data: update_ranges,
        valueInputOption: 'RAW'
    }

    gsheet.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: resource,
    }).catch(() => {
        logger.warning("Could not update codes to sent ('oui') in spreadsheet")
    });

    return update_ranges.length;
}

schedule("1 0 * * *", async () => {
    const sent = await send_member_codes();
    logger.info(`Sent ${sent} codes at ${new Date(Date.now()).toLocaleDateString()}`);
});

export { gsheet };
