import { config as dotenv } from "dotenv";
dotenv();

const config: NodeJS.ProcessEnv = {
	TOKEN: process.env.TOKEN,
	PASSWORD: process.env.PASSWORD,
	PORT: process.env.PORT || "3000",
	CRON_LEGICA: process.env.CRON_LEGICA || "0 9 * * *",
};

export { config };
