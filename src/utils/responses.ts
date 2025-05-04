import { Response, NextFunction } from "express";

export const sendJson = (target: Response, code?: number) => (value: any) => {
  target.status(code || 200).json(value)
}
export const sendError = (target: NextFunction | Response, code?: number) => (err: any) => {
  if ((target as Response).send) {
    const status = code || err.statusCode || 500;
    if (typeof err === 'string') {
      (target as Response).status(status).json(
        { message: err }
      );
    } else {
      const message = err.message;
      const data = err.data;
      const stack = err.stack;
      err = { message, data, stack }
      console.error('ooooooo=', err);
      (target as Response).status(status).json(err);
    }
  } else {

    if (typeof err === 'string') {
      err = { message: err }
    }
    if (!err.statusCode) {
      err.statusCode = code || 500;
    }

    (target as NextFunction)(err);
  }
}