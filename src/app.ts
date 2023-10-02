import { Client } from "discord.js";
import { Chat } from "@common";
import { Controller } from "@core";
import { ClientController } from "@controllers";
import express from "express";
import { config } from "@constants";
import basicAuth from "express-basic-auth";
import bodyParser from "body-parser";

const client: Client = new Client();
const chat: Chat = new Chat(client);
const app = express();

app.use(bodyParser.json());

app.use(
	basicAuth({
		users: {
			admin: config.PASSWORD,
		},
	})
);

const controllers = new Controller([new ClientController(client, app)]);

controllers.register();
chat.register(config.TOKEN || "");
app.listen(config.PORT);
