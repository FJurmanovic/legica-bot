import { Router } from "express";

export interface IController {
	register(): void;
	registerRouter(): Router;
	path: string;
}
