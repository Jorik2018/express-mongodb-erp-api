import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express';

const { ErrorHandler } = require("../helpers/errorsHelper");

const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  const { JWT_SECRET } = require('../config').default;
  jwt.verify(authorization!, JWT_SECRET, (err: any, decoded: any) => {
    if (err && err.message === "jwt expired") {
      next(new ErrorHandler(401, "Session expired"));
    } else if (err) {
      next(new ErrorHandler(401, "Unauthorized"));
    } else {
      next();
    }
  });
};


export default authMiddleware;
