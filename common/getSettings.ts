import { readFileSync } from "fs";

export default function getSettings(environment: string) {
	let _returnValue = null;
	if (environment === "development") {
		try {
			_returnValue = safelyJsonParse(readFileSync("./.configs/development/config.json", "utf-8"));
		} catch (err) {
			_returnValue = null;
		}
	} else if (environment === "testing") {
		try {
			_returnValue = safelyJsonParse(readFileSync("./.configs/testing/config.json", "utf-8"));
		} catch (err) {
			_returnValue = null;
		}
	} else if (environment === "production") {
		try {
			_returnValue = safelyJsonParse(readFileSync("./.configs/production/config.json", "utf-8"));
		} catch (err) {
			_returnValue = null;
		}
	}
	return _returnValue;
}

function safelyJsonParse(data: any) {
	try {
		return JSON.parse(data);
	} catch (err) {
		return "";
	}
}
