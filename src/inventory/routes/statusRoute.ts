import { Request, Router } from 'express';

export default ({ getBookstoresBooksStatus }: any) => {

  const router = Router();

  router.get("/bookstores-books", (_req: Request, res, next) => {
    getBookstoresBooksStatus()
      .then((result: any) => {
        res.json(result);
      })
      .catch((err: any) => next(err));
  });

  return router;

};
