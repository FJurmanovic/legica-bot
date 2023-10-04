import { config as dotenv } from "dotenv";
import { version } from "../../package.json";
dotenv();

type Config = {
	APP_VERSION: string;
	LEGICA_URL: string;
};

export type ProjectConfig = Config & NodeJS.ProcessEnv;

const config: ProjectConfig = {
	TOKEN: process.env.TOKEN,
	PASSWORD: process.env.PASSWORD,
	PORT: process.env.PORT || "3000",
	CRON_LEGICA: process.env.CRON_LEGICA || "0 9 * * *",
	APP_VERSION: version,
	LEGICA_URL: "https://sib.net.hr/legica-dana",
};

export { config };
