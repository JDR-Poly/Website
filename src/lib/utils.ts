function getBase64(image: File | Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			resolve((e?.target?.result as string).split(',')[1]);
		};
		reader.onerror = reject;
	});
}

function getByteArrayFromBase64(base64String: string): Buffer {
	return Buffer.from(base64String, 'base64')
}

const __envDir = import.meta.env.PROD ? "build/client/" : "static/"

function getUTCDateStringOrNullFromString(stringDate: string | null | undefined): string | null {
	if (!stringDate) return null
	try {
		return new Date(Date.parse(stringDate)).toUTCString()
	} catch (exception) {
		return null
	}
}
export { getBase64, __envDir, getUTCDateStringOrNullFromString, getByteArrayFromBase64 }