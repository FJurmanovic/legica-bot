import { Client } from "discord.js";
import Chat from "./common/chat";
import { config as dotenv } from "dotenv";
import { Controller } from "./core";
import { ClientController } from "./controllers";
import { ENVIRONMENT } from "./constants";
import { getSettings } from "./common";

dotenv();

const environment: string = ENVIRONMENT;
const appSettings: any = getSettings(environment);

const client: Client = new Client();
const chat: Chat = new Chat(client);

const controllers = new Controller(new ClientController(client));

controllers.register();
chat.register(appSettings?.token || process.env.DEV_TOKEN || "");
