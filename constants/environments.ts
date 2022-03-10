export const ENVIRONMENTS = ["development", "testing", "production"];
export const ENVIRONMENT =
	ENVIRONMENTS.filter((env) => process?.argv?.includes?.(`--${env}`))?.[0] || "development";
