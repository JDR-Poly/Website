/** @format */

import { db } from "./postgresClient";
import pgPromise from "pg-promise";
import { type GlobalSettings } from "$gtypes";
import { building } from "$app/environment";
import { logger } from "./logger";

const pgp = pgPromise();
const {ColumnSet, insert} = pgp.helpers;

const default_settings: GlobalSettings = {
    gsheet_id: "",
    gsheet_sync_enabled: false,
    code_validity_days: 7
}

let global_settings: GlobalSettings = default_settings;

async function load_settings() {
    const res = await db.any(
        "SELECT key, value FROM global_settings"
    ).catch(() => null);
    let data = {};
    if (res){
        data = Object.fromEntries(res.map(s => [s.key, s.value]));
    }
    return {
        gsheet_id: "gsheet_id" in data ? data.gsheet_id as string : default_settings.gsheet_id,
        gsheet_sync_enabled: "gsheet_sync_enabled" in data ? (data.gsheet_sync_enabled === "true") : default_settings.gsheet_sync_enabled,
        code_validity_days: "code_validity_days" in data ? Number(data.code_validity_days) : default_settings.code_validity_days,
    }
}

async function preload_settings() {
    if (building) return;

    global_settings = await load_settings();
    logger.info("loaded settings");
}

async function update_settings(new_settings: GlobalSettings) {
    const to_update: any[] = Object.keys(new_settings).reduce((a: any[], k) => {
        const kk = k as keyof GlobalSettings;
        if (new_settings[kk] !== global_settings[kk]) {
            a = a.concat([{
                key: k,
                value: String(new_settings[kk])
            }])
        }
        return a;
    }, [])

    if (to_update.length === 0)
        return;

    const cs = new ColumnSet(['key', 'value'], {table: 'global_settings'});
    const onConflict = ' ON CONFLICT(key) DO UPDATE SET ' +
        cs.assignColumns({from: 'EXCLUDED', skip: ['key']});
    const query = insert(to_update, cs) + onConflict;

    await db.none(query);
    logger.info(`updated the following settings: ${JSON.stringify(to_update)}`);
}

export { preload_settings, load_settings, update_settings, global_settings };
