import { Request, Response, Router } from 'express'
const router = Router();
const regex = require("../helpers/regex");
const { ErrorHandler } = require("../helpers/errorsHelper");

export default ({ getUsers, getUserById }: any) => {
  router.get("/", (req, res, next) => {
    getUsers()
      .then((users: any) => {
        res.json(users);
      })
      .catch((err: any) => next(err));
  });

  router.get(`/:id(${regex.id})`, (req, res, next) => {
    const { id } = req.params;
    getUserById(id)
      .then((result: any[]) => {
        if (!result.length) throw new ErrorHandler(404, "Not found");
        res.json(result[0]);
      })
      .catch((err: any) => next(err));
  });

  return router;
};
