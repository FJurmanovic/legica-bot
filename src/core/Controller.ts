import { IController } from "models";

class Controller {
	constructor(private controllers: IController[]) {}

	public register = (): void => {
		this.controllers?.forEach((controller) => {
			controller.register();
		});
	};
}

export default Controller;
