import { NextFunction, Request, Response, Router } from 'express'
import { sendError } from '../../utils/errors';

const regex = require("../helpers/regex");
const { ErrorHandler } = require("../helpers/errorsHelper");

export default ({
  getBookstores,
  createBookstore,
  getBookstoreById,
  getBookstoreByContent,
  deleteBookstoreById,
  getBooksForBookstoreById,
}: any) => {

  const router = Router();

  router.get("/", (req: Request, res: Response, next: NextFunction) => {
    getBookstores()
      .then((bookstores: any) => {
        res.json(bookstores);
      })
      .catch(sendError(next));
  });

  router.post("/", (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;
    if (!name) {
      next(new ErrorHandler(400, "Missing field(s)"));
    } else {
      getBookstoreByContent(name)
        .then((result: any[]) => {
          if (result.length)
            throw new ErrorHandler(403, "Already existing resource");
          createBookstore(name).then((result: any) => {
            res.status(201).json(result[0]);
          });
        })
        .catch(sendError(next));
    }
  });

  router.get(`/:id(${regex.id})`, (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    getBookstoreById(id)
      .then((result: any) => {
        if (!result.length) throw new ErrorHandler(404, "Not found");
        res.json(result[0]);
      })
      .catch(sendError(next));
  });

  router.delete(`/:id(${regex.id})`, (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    getBookstoreById(id)
      .then((result: any[]) => {
        if (!result.length) throw new ErrorHandler(404, "Not found");
        deleteBookstoreById(id).then((result: any[]) => {
          res.status(202).json(result[0]);
        });
      })
      .catch(sendError(next));
  });

  router.get(`/:id(${regex.id})/books`, (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    getBookstoreById(id)
      .then((result: any[]) => {
        if (!result.length) throw new ErrorHandler(404, "Not found");
        getBooksForBookstoreById(id).then((result: any) => {
          res.json(result);
        });
      })
      .catch(sendError(next));
  });

  return router;
};
