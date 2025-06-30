import { config as dotenv } from "dotenv";
import { version } from "../../package.json";
dotenv();

type Config = {
	APP_VERSION: string;
	LEGICA_URL: string;
	RETRY_ATTEMPTS: number;
};

export type ProjectConfig = Config & NodeJS.ProcessEnv;

const config: ProjectConfig = {
	TOKEN: process.env.TOKEN,
	PASSWORD: process.env.PASSWORD,
	PORT: process.env.PORT || "3000",
	CRON_LEGICA: process.env.CRON_LEGICA || "0 9 * * *",
	APP_VERSION: version,
	LEGICA_URL: "https://sib.net.hr/legica-dana",
	TIMEZONE: process.env.TIMEZONE || "utc",
	LEGICA_DATE_FORMAT: process.env.LEGICA_DATE_FORMAT || "D.M.YYYY",
	RETRY_ATTEMPTS: parseInt(process.env.RETRY_ATTEMPTS || "3", 10),
};

export { config };
