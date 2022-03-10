class Controller {
	private controllers: any[];
	constructor(...args: any[]) {
		this.controllers = [...args];
	}

	public register = (): void => {
		this?.controllers?.forEach?.((controller) => {
			controller.register();
		});
	};
}

export default Controller;
