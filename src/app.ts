import { Client } from "discord.js";
import { config } from "@constants";
import { CronJob } from "cron";
import { sendDiscordMessage, sendNextMessage } from "@common";
import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { basicAuth } from "@core";
import pino from "pino";
import staticPlugin from "@elysiajs/static";

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

const taskPlugin = new Elysia({ prefix: "/job" })
	.state("job", null as CronJob | null)
	.onStart(({ store }) => {
		client.on("ready", (): void => {
			if (store.job) {
				store.job.stop();
			}
			store.job = new CronJob(
				config.CRON_LEGICA,
				() => sendNextMessage(client),
				null,
				true,
				"utc"
			);
		});
	})
	.onBeforeHandle(({ store: { job }, set }) => {
		if (!job) {
			set.status = 400;
			return "Job is not running.";
		}
	})
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
	.get("/", ({ store: { job } }) => ({
		running: job?.running ?? false,
		next: job?.nextDate().toISO(),
	}))
	.post("/", ({ store: { job }, set }) => {
		if (job?.running) {
			set.status = 400;
			return "Task already running";
		}
		job?.start();
		return "Task started";
	})
	.delete("/", ({ store: { job }, set }) => {
		if (!job?.running) {
			set.status = 400;
			return "Task already stopped";
		}
		job?.stop();
		return "Task stopped";
	})
	.post(
		"/send",
		async ({ set, body }) => {
			try {
				const url = body.url;
				if (url) {
					await sendDiscordMessage(client, url);
				} else {
					await sendNextMessage(client);
				}
				return true;
			} catch (err) {
				set.status = 400;
				return err;
			}
		},
		{
			body: t.Object({
				url: t.String(),
			}),
		}
	)
	.get("/log", () => Bun.file("app.log"));

client.login(config.TOKEN);

const app = new Elysia()
	.onError(({ error }) => {
		logger.error(error);
		return new Response(error.toString());
	})
	.get("/", () => config.APP_VERSION)
	.use(
		swagger({
			documentation: {
				info: {
					title: "Legica Bot",
					version: config.APP_VERSION,
				},
			},
		})
	)
	.use(staticPlugin())
	.use(taskPlugin)
	.listen(config.PORT);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
