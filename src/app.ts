import { Client } from "discord.js";
import { Chat } from "@common";
import { Controller } from "@core";
import { ClientController } from "@controllers";
import express from "express";
import { APP_VERSION, config } from "@constants";
import bodyParser from "body-parser";
import redoc from "redoc-express";
import path from "path";

const client: Client = new Client();
const chat: Chat = new Chat(client);
const app = express();

app.use(bodyParser.json());

app.get("/docs/swagger.json", (req, res) => {
	res.sendFile("swagger.json", { root: path.join(__dirname, "..") });
});
app.get(
	"/docs",
	redoc({
		title: "API Docs",
		specUrl: "/docs/swagger.json",
		nonce: "",
		redocOptions: {
			theme: {
				colors: {
					primary: {
						main: "#6EC5AB",
					},
				},
				typography: {
					fontFamily: `"museo-sans", 'Helvetica Neue', Helvetica, Arial, sans-serif`,
					fontSize: "15px",
					lineHeight: "1.5",
					code: {
						code: "#87E8C7",
						backgroundColor: "#4D4D4E",
					},
				},
				menu: {
					backgroundColor: "#ffffff",
				},
			},
		},
	})
);

app.get("version", (_, res) => {
	res.send(APP_VERSION);
});

const controllers = new Controller(app, [new ClientController(client)]);

controllers.register();
chat.register(config.TOKEN || "");
app.listen(config.PORT, () =>
	console.log(`Legica bot API listening on port ${config.PORT}!`)
);
