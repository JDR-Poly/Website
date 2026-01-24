/** @format */

import type { MembershipCode } from "$gtypes";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch }) => {
	return {
		codes: await fetch("/api/codes")
			.then(async (res) => {
				if (!res.ok) {
					return [];
				}
				return res.json();
			})
			.then((codes) => {
				codes.forEach((code: any) => {
					code.email_sent = new Date(Date.parse(code.email_sent));
				});
				return codes;
			})
			.then((codes: MembershipCode[]) => {
				return codes.sort((a, b) => {
					if (a.email_sent < b.email_sent) return 1;
					else if (a.email_sent.getTime() == b.email_sent.getTime()) return 0;
					else return -1;
				});
			}),
	};
}) satisfies PageLoad;
