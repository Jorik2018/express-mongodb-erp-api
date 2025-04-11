import { Response, NextFunction } from "express";

export const sendError = (target: NextFunction | Response, code?: number) => (err: any) => {
  if ((target as Response).send) {
    const status = code || err.statusCode || 500;
    const message = typeof err === 'string' ? err : err.message;
    const stack = typeof err === 'string' ? null : err.stack;
    const data = typeof err === 'string' ? null : err.data;
    console.error(err);
    (target as Response).status(status).json(
      { message, data }
    );
  } else {
    if (!err.statusCode) {
      err.statusCode = code || 500;
    }
    (target as NextFunction)(err);
  }
}