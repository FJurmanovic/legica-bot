import { Client } from "discord.js";
import Chat from "./common/chat";
import { config as dotenv } from "dotenv";
import { Controller } from "./core";
import { ClientController } from "./controllers";

dotenv();

const client: Client = new Client();
const chat: Chat = new Chat(client);

const controllers = new Controller(new ClientController(client));

controllers.register();
chat.register(process.env.DEV_TOKEN || "");
