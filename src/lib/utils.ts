function getBase64(image: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			resolve((e?.target?.result as string).split(',')[1]);
		};
		reader.onerror = reject;
	});
}

const __envDir = import.meta.env.PROD ? "build/client/" : "static/"

export {getBase64, __envDir}