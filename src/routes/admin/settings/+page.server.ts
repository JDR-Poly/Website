/** @format */

import { load_settings, update_settings, global_settings } from "$lib/server/settings";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
	if (!locals.authenticated) throw error(401);
	if (!hasRolePermission(UserPermission.SETTINGS_PANEL, locals.user?.role)) {
		throw error(403);
	}

	// Load current settings
	const settings = await load_settings();
	return { settings };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, locals }) => {
		// Auth check
		if (!locals.authenticated) return fail(401, { message: "Not authenticated" });
		if (!hasRolePermission(UserPermission.MODIFY_SETTINGS, locals.user?.role)) {
			return fail(403, { message: "Forbidden" });
		}

		// Parse form
		const form = await request.formData();
		const gsheet_id = form.get("gsheet_id")?.toString() || global_settings.gsheet_id;

		const _gsheet_sync_enabled = form.get("gsheet_sync_enabled")?.toString();
		const gsheet_sync_enabled = _gsheet_sync_enabled ? _gsheet_sync_enabled === "true" : global_settings.gsheet_sync_enabled

		const _code_validity_days = form.get("code_validity_days")?.toString();
		const code_validity_days = _code_validity_days ? parseInt(_code_validity_days) : global_settings.code_validity_days

		// Validate
		if (code_validity_days < 1) {
			return fail(400, { message: "Code validity must be at least 1 day" });
		}

		// Update
		try {
			await update_settings({
				gsheet_id,
				gsheet_sync_enabled,
				code_validity_days,
			});
			return { success: true };
		} catch (err: any) {
			return fail(500, { message: err.message });
		}
	}
} satisfies Actions;
