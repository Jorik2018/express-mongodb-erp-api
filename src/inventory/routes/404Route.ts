import { Request, Response, NextFunction, Router } from 'express'

const { ErrorHandler } = require("../helpers/errorsHelper");

const router = Router();

const send404 = (_req: Request, _res: Response, next: NextFunction) => {
  next(new ErrorHandler(404, "Not found"));
};

router.all("/", send404);

export default router;
