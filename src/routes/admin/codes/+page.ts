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
					const dateA = new Date(Date.parse(a.email_sent));
					const dateB = new Date(Date.parse(b.email_sent));

					if (dateA < dateB) return 1;
					else if (dateA.getTime() == dateB.getTime()) return 0;
					else return -1;
				});
			}),
	};
}) satisfies PageLoad;
