import { Request, Response, Router, static as _static, Application } from 'express';

const app = Router();

app.use("/api/user", require("./routers/userRoutes"));
app.use("/api/profile", require("./routers/profileRoutes"));
app.use("/api/course", require("./routers/courseRoutes"));

const build = (app: Application) => {
	if (process.env.NODE_ENV === "production") {
		app.use(_static("../front-end/build"));
		app.get("*", (_req: Request, res: Response) => {
			res.sendFile(require('path').resolve(__dirname, "../front-end/build", "index.html"));
		});
	}
}

export default build;