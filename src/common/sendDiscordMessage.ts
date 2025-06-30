import { getFirstHtml, getImgTitle } from "@common";
import { config } from "@constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Client, MessageEmbed, TextChannel } from "discord.js";

dayjs.extend(customParseFormat);

/**
 * Retry mechanism for failed date checks
 *
 * This implementation allows the bot to retry fetching and posting content
 * when a date check fails. It will retry at hourly intervals for a number of attempts
 * specified by the RETRY_ATTEMPTS environment variable (defaults to 3).
 *
 * This is useful when:
 * 1. The website hasn't updated with today's post yet
 * 2. There are temporary network issues
 * 3. The website structure changed temporarily
 */

// Sleep function to delay between retry attempts
const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

export async function sendDiscordMessage(
	client: Client,
	url: string,
	dateCheck?: dayjs.Dayjs
): Promise<void> {
	const { img, title } = await getImgTitle(url);

	if (dateCheck) {
		const dateRegex = /\d{1,2}.\d{1,2}.\d{4}/g;
		const date = dateRegex.exec(title)?.[0];
		const dayjsDate = dayjs(date, config.LEGICA_DATE_FORMAT);
		if (!dateCheck.isSame(dayjsDate, "D"))
			throw new Error(
				`Post failed date check, date from post ${date}, date checked ${dateCheck.format(
					config.LEGICA_DATE_FORMAT
				)}`
			);
	}

	const promises = client.channels.cache.map(async (channel) => {
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
		} catch (err) {
			console.error(`Message to channel ${channel.id} failed.`);
			throw err;
		}
	});
	await Promise.all(promises);
}

/**
 * Fetches and sends the next legica-dana post to all Discord channels
 *
 * This function implements a retry mechanism that will:
 * 1. Try to fetch and post the latest content
 * 2. If it fails (especially due to date check), wait for 1 hour
 * 3. Retry up to the number of times specified in RETRY_ATTEMPTS env var
 *
 * @param client The Discord client used to send messages
 * @throws Error if all retry attempts fail
 */
export async function sendNextMessage(client: Client): Promise<void> {
	// Get max retry attempts from config
	const maxRetries = config.RETRY_ATTEMPTS;
	let attempts = 0;
	let lastError: Error | null = null;

	// Keep trying until we've reached max attempts
	while (attempts < maxRetries) {
		try {
			// Get the URL of the latest post
			const href = await getFirstHtml();
			if (!href) throw new Error("URL cannot be empty!");

			// Try to send the message
			await sendDiscordMessage(client, href, dayjs());

			// If successful, return
			return;
		} catch (error: unknown) {
			attempts++;
			const typedError = error instanceof Error ? error : new Error(String(error));
			lastError = typedError;

			// Log the retry attempt
			console.error(
				`Attempt ${attempts}/${maxRetries} failed: ${typedError.message}`
			);

			// If we've reached max attempts, throw the last error
			if (attempts >= maxRetries) {
				throw new Error(
					`Failed after ${attempts} attempts. Last error: ${
						lastError?.message || "Unknown error"
					}`
				);
			}

			// Wait for 1 hour before retrying (3600000 ms)
			console.log(
				`Waiting 1 hour before retry attempt ${attempts + 1}/${maxRetries}...`
			);
			await sleep(3600000);
		}
	}
}
