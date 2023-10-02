import { Message } from "discord.js";
import { APP_VERSION } from "../constants";

class CommonModule {
	constructor() {}
	public showVersion = (message: Message): void => {
		message?.channel?.send?.(`Current version of the Monke BOT is ${APP_VERSION}.`);
	};
}

export default CommonModule;
