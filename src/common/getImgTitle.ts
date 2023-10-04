import { Legica } from "@models";
import axios from "axios";
import cheerio from "cheerio";

export async function getImgTitle(href: string): Promise<Legica> {
	const response = await axios.get(href);
	const html = response.data;
	const $ = cheerio.load(html);

	const title = $(".Article-inner > h1").text();
	const { src: img } = $(".Article-media > img").attr() || {};

	return { title, img };
}
