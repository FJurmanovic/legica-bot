declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TOKEN: string;
			PORT: string;
			CRON_LEGICA: string;
			PASSWORD: string;
			TIMEZONE: string;
			LEGICA_DATE_FORMAT: string;
			RETRY_ATTEMPTS: string;
		}
	}
}

export {};
