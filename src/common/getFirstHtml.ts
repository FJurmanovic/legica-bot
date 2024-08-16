import { config } from "@constants";
import axios from "axios";
import cheerio from "cheerio";

export async function getFirstHtml(): Promise<string | undefined> {
	const response = await axios.get(config.LEGICA_URL);
	const html = response.data;
	const $ = cheerio.load(html);
	const href = $(".legica-dana").first().find("a").attr("href");
	return href;
}
