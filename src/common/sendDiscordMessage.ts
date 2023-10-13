import { getFirstHtml, getImgTitle } from "@common";
import { config } from "@constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Client, MessageEmbed, TextChannel } from "discord.js";

dayjs.extend(customParseFormat);

const dateRegex = /\d{1,2}.\d{1,2}.\d{4}/g;

export async function sendDiscordMessage(
	client: Client,
	url: string,
	dateCheck?: dayjs.Dayjs
): Promise<void> {
	if (!url) return;
	const { img, title } = await getImgTitle(url);

	if (dateCheck) {
		const date = dateRegex.exec(title)?.[0];
		const dayjsDate = dayjs(date, config.LEGICA_DATE_FORMAT);
		if (!dateCheck.isSame(dayjsDate, "D"))
			throw new Error(
				`Post failed date check, date from post ${date}, date checked ${dateCheck.format(
					config.LEGICA_DATE_FORMAT
				)}`
			);
	}

	client.channels.cache.forEach(async (channel) => {
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
}

export async function sendNextMessage(client: Client): Promise<void> {
	const href = await getFirstHtml();
	await sendDiscordMessage(client, href, dayjs());
}
