import { Client, Message, MessageEmbed } from "discord.js";
import axios from "axios";
import * as puppeteer from "puppeteer";

class PuleController {
	constructor(private client: Client) {}

	public register = (): void => {
		this.client.on("ready", (): void => {
			this.sendMessage();
		});
	};

	private sendMessage = async (): Promise<void> => {
		const href = await getFirstHtml();
		const user = await this.client.users.fetch("329236932309680128");
		const dm = await user.createDM();
		const embeddedMessage = new MessageEmbed().setTitle("Nibba").setImage(href || "");
		const msg = await dm.send(embeddedMessage);
	};
}

async function getFirstHtml(): Promise<string | undefined> {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(
		"https://duckduckgo.com/?q=black+guy&t=newext&atb=v315-4&iar=images&iax=images&ia=images"
	);
	await page.waitForSelector(".tile.tile--img.has-detail", { timeout: 10000 });

	const body = await page.evaluate(() => {
		function randomIntFromInterval(min: number, max: number): number {
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		const randNum = randomIntFromInterval(1, 25);
		return document.querySelectorAll(".tile.tile--img.has-detail")[randNum].querySelector("img")
			?.src;
	});

	await browser.close();

	return body;
}

export default PuleController;
