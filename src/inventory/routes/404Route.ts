const express = require("express");
import { Request, Response, NextFunction } from 'express'
const router = express.Router();
const { ErrorHandler } = require("../helpers/errorsHelper");

const send404 = (_req: Request, _res: Response, next: NextFunction) => {
  next(new ErrorHandler(404, "Not found"));
};

router.all("/", send404);

module.exports = router;
