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

export {getBase64}