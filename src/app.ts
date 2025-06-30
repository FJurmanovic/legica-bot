import { Client } from "discord.js";
import { config } from "@constants";
import { sendDiscordMessage, sendNextMessage } from "@common";
import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { basicAuth, BasicAuthError } from "@core";
import pino from "pino";
import cron from "@elysiajs/cron";

const client: Client = new Client();

const fileTransport = pino.transport({
	target: "pino/file",

	options: { destination: `app.log` },
});
const logger = pino(
	{
		level: "error",
	},
	fileTransport
);

async function jobRunner() {
	try {
		await sendNextMessage(client);
	} catch (err) {
		// Log detailed error information, including retry attempts
		if (err instanceof Error && err.message.includes("Failed after")) {
			logger.error({
				msg: "All retry attempts failed in job runner",
				error: err.message,
			});
		} else {
			logger.error({
				msg: "Error in job runner, no retries attempted",
				error: err,
			});
		}
	}
}
const botPlugin = new Elysia({ prefix: "/bot" })
	.use(
		basicAuth({
			users: [
				{
					username: "admin",
					password: config.PASSWORD,
				},
			],
			errorMessage: "Unauthorized",
		})
	)
	.get(
		"/",
		() => ({
			uptime: client.uptime,
			readyAt: client.readyAt,
			readyTimestamp: client.readyTimestamp,
		}),
		{
			detail: {
				summary: "Get BOT status",
			},
		}
	)
	.post(
		"/",
		() => {
			client.login(config.TOKEN);
			return "Bot logged in started";
		},
		{
			detail: {
				summary: "Start BOT if it is not running",
			},
		}
	)
	.delete(
		"/",
		() => {
			client.destroy();
			return "Bot logged out";
		},
		{
			detail: {
				summary: "Stops the BOT.",
			},
		}
	);

const taskPlugin = new Elysia({ prefix: "/job" })
	.use(
		cron({
			name: "job",
			pattern: config.CRON_LEGICA,
			run: jobRunner,
			paused: true,
			timezone: config.TIMEZONE,
		})
	)
	.onStart(
		({
			store: {
				cron: { job },
			},
		}: {
			store: {
				cron: {
					job: {
						resume: () => void;
					};
				};
			};
		}) => {
			client.on("ready", (): void => {
				job.resume();
			});
		}
	)
	.onBeforeHandle(
		({
			store: {
				cron: { job },
			},
			set,
		}: {
			store: {
				cron: {
					job: {
						isStopped: () => boolean;
					};
				};
			};
			set: {
				status: number;
			};
		}) => {
			if (job.isStopped()) {
				set.status = 400;
				return "Job is not running.";
			}
		}
	)
	.use(
		basicAuth({
			users: [
				{
					username: "admin",
					password: config.PASSWORD,
				},
			],
			errorMessage: "Unauthorized",
		})
	)
	.get(
		"/",
		({
			store: {
				cron: { job },
			},
		}: {
			store: {
				cron: {
					job: {
						isRunning: () => boolean;
						isStopped: () => boolean;
						nextRun: () => Date | null;
					};
				};
			};
		}) => ({
			running: job.isRunning() ?? false,
			stopped: job.isStopped() ?? false,
			next: job.nextRun()?.toISOString(),
		}),
		{
			detail: {
				summary: "Get CRON job status",
			},
		}
	)
	.post(
		"/",
		({
			store: {
				cron: { job },
			},
			set,
		}: {
			store: {
				cron: {
					job: {
						isRunning: () => boolean;
						resume: () => void;
					};
				};
			};
			set: {
				status: number;
			};
		}) => {
			if (job.isRunning()) {
				set.status = 400;
				return "Job already running";
			}
			job.resume();
			return "Job started";
		},
		{
			detail: {
				summary: "Start CRON job if it is not running",
			},
		}
	)
	.delete(
		"/",
		({
			store: {
				cron: { job },
			},
			set,
		}: {
			store: {
				cron: {
					job: {
						isRunning: () => boolean;
						pause: () => void;
					};
				};
			};
			set: {
				status: number;
			};
		}) => {
			if (!job.isRunning()) {
				set.status = 400;
				return "Job already paused";
			}
			job.pause();
			return "Job paused";
		},
		{
			detail: {
				summary: "Pause CRON job if it is not paused",
			},
		}
	)
	.post(
		"/send",
		async ({
			set,
			body,
		}: {
			set: {
				status: number;
			};
			body?: {
				url?: string;
			};
		}) => {
			try {
				const url = body?.url;
				if (url) {
					await sendDiscordMessage(client, url);
				} else {
					await sendNextMessage(client);
				}
				return true;
			} catch (err: unknown) {
				set.status = 400;
				logger.error(err);
				return false;
			}
		},
		{
			body: t.Optional(
				t.Object({
					url: t.Optional(t.String()),
				})
			),
			detail: {
				summary: "Send legica-dana post to discord channels",
			},
		}
	)
	.get("/log", () => Bun.file("app.log"), {
		detail: {
			summary: "Get the error log",
		},
	});
const app = new Elysia()
	.error({ BASIC_AUTH_ERROR: BasicAuthError })
	.onError(({ error, code }: { error: Error; code: string }) => {
		switch (code) {
			case "BASIC_AUTH_ERROR":
				return new Response(error.message, {
					status: 401,
					headers: {
						"WWW-Authenticate": `Basic${
							config.realm ? ` realm="${config.realm}"` : ""
						}`,
					},
				});
			case "NOT_FOUND":
				return new Response(error.message, {
					status: 404,
				});
			default:
				logger.error(error);
		}
	})
	.get("/", () => config.APP_VERSION, {
		detail: {
			summary: "Get current API version",
		},
	})
	.use(
		swagger({
			documentation: {
				info: {
					title: "Legica Bot",
					version: config.APP_VERSION,
				},
				security: [
					{
						type: ["basic"],
					},
				],
			},
			swaggerOptions: {
				withCredentials: true,
			},
		})
	)
	.use(taskPlugin)
	.use(botPlugin)
	.listen(config.PORT);

client.login(config.TOKEN);
console.log(
	`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
