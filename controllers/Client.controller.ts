import { Client, MessageEmbed, TextChannel } from "discord.js";
import * as cron from "node-cron";
import axios from "axios";
import cheerio from "cheerio";

class ClientController {
	constructor(private client: Client) {}

	public register = (): void => {
		this.client.on("ready", (): void => {
			cron.schedule("0 12 * * *", this.sendMessage);
		});
	};

	private sendMessage = async (): Promise<void> => {
		const href = await getFirstHtml();
		const { img, title } = await getImgTitle(href);

		this.client.channels.cache.forEach((channel) => {
			if (channel.type !== "text") return null;
			const embeddedMessage = new MessageEmbed().setTitle(title).setImage(img);
			(channel as TextChannel).send(embeddedMessage);
		});
	};
}

type Legica = {
	img: string;
	title: string;
};

async function getImgTitle(href: string): Promise<Legica> {
	const response = await axios.get(href);
	const html = response.data;
	const $ = cheerio.load(html);

	const title = $(".Article-inner > h1").text();
	const { src: img } = $(".Article-media > img")?.attr();

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
