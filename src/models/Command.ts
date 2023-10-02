import { Message } from "discord.js";

export type CommandFunction = (message: Message, args?: string[]) => void;

export interface ICommand {
	callback: CommandFunction;
	name: string;
}
