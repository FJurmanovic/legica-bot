import { Legica } from "@models";
import axios from "axios";
import cheerio from "cheerio";

export async function getImgTitle(href: string): Promise<Legica> {
	const response = await axios.get(href);
	const html = response.data;
	const $ = cheerio.load(html);

	const title = $(".article-title-container > h1").text();
	const src = $(".image-holder", ".article-content").find("img").attr("src");
	if (!src) throw new Error(`Image not found at ${href}.`);

	return { title, img: src };
}
