import { CommandFunction, ICommand } from "@models";
import type { Client, Message } from "discord.js";

export default class Chat {
	private prefix: string = "!";
	constructor(private client: Client, private commands: ICommand[] = []) {}

	public registerPrefix = (prefix: string): void => {
		this.prefix = prefix;
	};

	public register = (token: string): void => {
		if (!this.commands) return;
		this.client.on("message", (message: Message): void => {
			this.commands.forEach((command) => {
				if (message?.content === `${this.prefix}${command?.name}`) {
					command?.callback?.(message);
				} else if (
					message?.content?.split?.(/\s/g)?.[0] == `${this.prefix}${command?.name}`
				) {
					const args = message?.content
						?.replace?.(`${this.prefix}${command?.name}`, "")
						.trim?.()
						?.split?.(/\s(?=(?:[^'"`]*(['"`])[^'"`]*\1)*[^'"`]*$)/g)
						.map((d) => {
							if (d?.[0] == '"' && d?.[d?.length - 1] == '"') {
								return d?.substr?.(1)?.slice?.(0, -1);
							}
							return d;
						})
						.filter((d) => d);
					command?.callback?.(message, args);
				}
			});
		});
		this.client.login(token);
	};

	public command = (name: string, callback: CommandFunction): void => {
		this.commands = [
			...this.commands,
			{
				name,
				callback,
			},
		];
	};
}
