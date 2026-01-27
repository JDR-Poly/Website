export function validateEmail(email?: string): Boolean {
	if (!email) return false;
	return new RegExp("^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$").test(email);
}
