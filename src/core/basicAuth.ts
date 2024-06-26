import Elysia from "elysia";
import { minimatch } from "minimatch";

export class BasicAuthError extends Error {
	constructor(public message: string) {
		super(message);
	}
}

export interface BasicAuthUser {
	username: string;
	password: string;
}

export interface BasicAuthConfig {
	users: BasicAuthUser[];
	realm?: string;
	errorMessage?: string;
	exclude?: string[];
	noErrorThrown?: boolean;
}

export const basicAuth = (config: BasicAuthConfig) =>
	new Elysia({ name: "basic-auth", seed: config })
		.derive((ctx) => {
			const authorization = ctx.headers?.authorization;
			if (!authorization) return { basicAuth: { isAuthed: false, username: "" } };
			const [username, password] = atob(authorization.split(" ")[1]).split(":");
			const user = config.users.find(
				(user) => user.username === username && user.password === password
			);
			if (!user) return { basicAuth: { isAuthed: false, username: "" } };
			return { basicAuth: { isAuthed: true, username: user.username } };
		})
		.onTransform((ctx) => {
			if (
				!ctx.basicAuth.isAuthed &&
				!config.noErrorThrown &&
				!isPathExcluded(ctx.path, config.exclude) &&
				ctx.request &&
				ctx.request.method !== "OPTIONS"
			) {
				throw new BasicAuthError(config.errorMessage ?? "Unauthorized");
			}
		});

export const isPathExcluded = (path: string, excludedPatterns?: string[]) => {
	if (!excludedPatterns) return false;
	for (const pattern of excludedPatterns) {
		if (minimatch(path, pattern)) return true;
	}
	return false;
};
