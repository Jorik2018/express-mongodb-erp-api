const express = require("express");
const router = express.Router();

module.exports = ({ getBookstoresBooksStatus }) => {
  router.get("/bookstores-books", (req, res, next) => {
    getBookstoresBooksStatus()
      .then((result) => {
        res.json(result);
      })
      .catch((err:any) => next(err:any));
  });

  return router;
};
