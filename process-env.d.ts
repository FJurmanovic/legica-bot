declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TOKEN: string;
			PORT: string;
			CRON_LEGICA: string;
			PASSWORD: string;
			TIMEZONE: string;
		}
	}
}

export {};
