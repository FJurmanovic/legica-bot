import { IController } from "models";
import { Express } from "express";

class Controller {
	constructor(private app: Express, private controllers: IController[]) {}

	public register = (): void => {
		this.controllers?.forEach((controller) => {
			controller.register();
			this.app.use(controller.path || "", controller.registerRouter());
		});
	};
}

export default Controller;
