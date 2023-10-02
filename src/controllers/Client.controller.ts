import { Client, MessageEmbed, TextChannel } from "discord.js";
import * as cron from "cron";
import axios from "axios";
import cheerio from "cheerio";
import { Router } from "express";
import { IController, Legica } from "@models";
import { config } from "@constants";
import basicAuth from "express-basic-auth";

class ClientController implements IController {
	private legicaTask: cron.CronJob | null = null;
	public path: string = "/task";
	constructor(private client: Client) {}

	public register = (): void => {
		this.client.on("ready", (): void => {
			this.legicaTask = new cron.CronJob(
				config.CRON_LEGICA,
				this.sendNextMessage,
				null,
				true,
				"utc"
			);
		});
	};

	public registerRouter = (): Router => {
		const router = Router();

		router.use(
			basicAuth({
				users: {
					admin: config.PASSWORD,
				},
			})
		);
		router.get("/", (_, res) => {
			res.send(this.legicaTask?.running);
		});

		router.post("/", (_, res) => {
			if (this.legicaTask?.running) {
				res.status(400).send("Task already running.");
			} else {
				this.legicaTask?.start();
				res.send("Task started.");
			}
		});

		router.delete("/", (_, res) => {
			if (!this.legicaTask?.running) {
				res.status(400).send("Task already stopped.");
			} else {
				this.legicaTask.stop();
				res.send("Task stopped.");
			}
		});

		router.get("/next", (_, res) => {
			if (!this.legicaTask?.running) {
				res.status(400).send("Task is not running.");
			} else {
				res.send(this.legicaTask.nextDate().toISO());
			}
		});

		router.post("/send-latest", async (_, res) => {
			try {
				await this.sendNextMessage();
				res.send(true);
			} catch (err) {
				res.status(400).send(err);
			}
		});

		router.post("/send", async (req, res) => {
			try {
				const url = req.body.url;
				await this.sendMessage(url);
				res.send(true);
			} catch (err) {
				res.status(400).send(err);
			}
		});
		return router;
	};

	private sendNextMessage = async (): Promise<void> => {
		try {
			const href = await getFirstHtml();
			await this.sendMessage(href);
		} catch (err) {
			console.error(err);
		}
	};

	private sendMessage = async (url: string): Promise<void> => {
		if (!url) return;
		const { img, title } = await getImgTitle(url);

		this.client.channels.cache.forEach(async (channel) => {
			try {
				if (channel.type !== "text") return null;
				const embeddedMessage = new MessageEmbed().setTitle(title).setImage(img);
				const msg = await (channel as TextChannel).send(embeddedMessage);
				const reactions = [
					"1️⃣",
					"2️⃣",
					"3️⃣",
					"4️⃣",
					"5️⃣",
					"6️⃣",
					"7️⃣",
					"8️⃣",
					"9️⃣",
					"🔟",
				];
				for (const reaction of reactions) {
					try {
						await msg.react(reaction);
					} catch {
						console.error(`Reaction ${reaction} to channel ${channel.id} failed.`);
					}
				}
			} catch {
				console.error(`Message to channel ${channel.id} failed.`);
			}
		});
	};
}

async function getImgTitle(href: string): Promise<Legica> {
	const response = await axios.get(href);
	const html = response.data;
	const $ = cheerio.load(html);

	const title = $(".Article-inner > h1").text();
	const { src: img } = $(".Article-media > img").attr() || {};

	return { title, img };
}

async function getFirstHtml(): Promise<string> {
	const response = await axios.get("https://sib.net.hr/legica-dana");
	const html = response.data;
	const $ = cheerio.load(html);
	const { href } = $(".News-link.c-def")?.attr() || {};
	return href;
}

export default ClientController;
