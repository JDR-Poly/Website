/** @format */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import type { DateString } from "$gtypes";
import { Roles } from "./userPermissions";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 },
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t,
			});
		},
		easing: cubicOut,
	};
};

function getBase64(image: File | Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			resolve((e?.target?.result as string).split(",")[1]);
		};
		reader.onerror = reject;
	});
}

function getByteArrayFromBase64(base64String: string): Buffer {
	return Buffer.from(base64String, "base64");
}

const __envDir = import.meta.env.PROD ? "build/client/" : "static/";

function getLocalDateStringOrNullFromString(stringDate: string | null | undefined): string | null {
	if (!stringDate) return null;
	try {
		return new Date(Date.parse(stringDate)).toISOString();
	} catch (exception) {
		return null;
	}
}

function parseToLocalDateStringWithoutMilis(date: DateString): string {
	const newDate = new Date(Date.parse(date));
	newDate.setHours(newDate.getHours() + 2);
	return newDate.toISOString().slice(0, -8);
}

function getTranslatedRoleName(name: string): string {
	switch (name) {
		case Roles.ADMIN.name:
			return "Administrateur";
			break;
		case Roles.COMMITTEE.name:
			return "Comité";
			break;
		case Roles.HONORARY_MEMBER.name:
			return "Membre d'honneur";
			break;
		case Roles.MEMBER.name:
			return "Membre";
			break;
		case Roles.USER.name:
			return "Utilisateur";
			break;
		case Roles.DISCORD_BOT.name:
			return "Bot discord";
			break;
	}
	return "Erreur de rôle";
}

export {
	getBase64,
	__envDir,
	getByteArrayFromBase64,
	parseToLocalDateStringWithoutMilis,
	getTranslatedRoleName,
};
