import { Request, Response, Router, NextFunction } from 'express'
import { sendError } from "../../utils/responses";

const router = Router();
const regex = require("../helpers/regex");
const { ErrorHandler } = require("../helpers/errorsHelper");
const { get } = require("./404Route");

export default ({
  getBooks,
  createBook,
  getBookById,
  getBookByContent,
  deleteBookById,
  getBookstoresForBookById,
}: any) => {
  router.get("/", (req: Request, res: Response, next: NextFunction) => {
    getBooks()
      .then((books: any[]) => {
        res.json(books);
      })
      .catch(sendError(res));
  });

  router.post("/", (req: Request, res: Response, next: NextFunction) => {
    const { title, author, summary } = req.body;
    if (!title || !author || !summary) {
      next(new ErrorHandler(400, "Missing field(s)"));
    } else {
      getBookByContent(title, author)
        .then((result: any[]) => {
          if (result.length)
            throw new ErrorHandler(403, "Already existing resource");
          createBook(title, author, summary).then((result: any[]) => {
            res.status(201).json(result[0]);
          });
        })
        .catch((err: any) => next(err));
    }
  });

  router.get(`/:id(${regex.id})`, (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    getBookById(id)
      .then((result: any[]) => {
        if (!result.length) throw new ErrorHandler(404, "Not found");
        res.json(result[0]);
      })
      .catch((err: any) => next(err));
  });

  router.delete(`/:id(${regex.id})`, (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    getBookById(id)
      .then((result: any[]) => {
        if (!result.length) throw new ErrorHandler(404, "Not found");
        deleteBookById(id).then((result: any[]) => {
          res.status(202).json(result[0]);
        });
      })
      .catch((err: any) => next(err));
  });

  router.get(`/:id(${regex.id})/bookstores`, (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    getBookById(id)
      .then((result: any[]) => {
        if (!result.length) throw new ErrorHandler(404, "Not found");
        getBookstoresForBookById(id).then((result: any) => {
          res.json(result);
        });
      })
      .catch((err: any) => next(err));
  });

  return router;
};
