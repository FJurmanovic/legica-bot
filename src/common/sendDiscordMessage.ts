import { getFirstHtml, getImgTitle } from "@common";
import { Client, MessageEmbed, TextChannel } from "discord.js";

export async function sendDiscordMessage(
	client: Client,
	url: string
): Promise<void> {
	if (!url) return;
	const { img, title } = await getImgTitle(url);

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
	try {
		const href = await getFirstHtml();
		await sendDiscordMessage(client, href);
	} catch (err) {
		console.error(err);
	}
}
