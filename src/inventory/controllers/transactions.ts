
import { Router, Request, Response } from 'express';

let router = Router();

let Datastore = require("nedb");

let Inventory = require("./inventory");

let Transactions = new Datastore({
  filename: "./server/databases/transactions.db",
  autoload: true
});

router.get("/all", (req: any, res: Response) => {
  Transactions.find({}, (err: any, docs: any) => {
    res.send(docs);
  });
});

router.get("/limit", ({query}: Request, res: Response) => {
  let limit = parseInt(query.limit as string, 10);
  if (!limit) limit = 5;

  Transactions.find({})
    .limit(limit)
    .sort({ date: -1 })
    .exec((err: any, docs: any) => {
      res.send(docs);
    });
});

router.get("/day-total", ({query}: Request, res: Response) => {
  let startDate: any;
  let endDate: any;
  if (query.date) {
    startDate = new Date(query.date as string);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(query.date as string);
    endDate.setHours(23, 59, 59, 999);
  } else {
    // beginning of current day
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    // end of current day
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
  }

  Transactions.find(
    { date: { $gte: startDate.toJSON(), $lte: endDate.toJSON() } },
    (err: any, docs: any) => {
      let result: any = {
        date: startDate
      };

      if (docs) {
        let total = docs.reduce((p: any, c: any) => {
          return p + c.total;
        }, 0.0);

        result.total = parseFloat(parseFloat(total).toFixed(2));

        res.send(result);
      } else {
        result.total = 0;
        res.send(result);
      }
    }
  );
});

router.get("/by-date", (req: any, res: Response) => {
  let startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  let endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  Transactions.find(
    { date: { $gte: startDate.toJSON(), $lte: endDate.toJSON() } },
    (err: any, docs: any) => {
      if (docs) res.send(docs);
    }
  );
});

router.post("/new", (req: any, res: Response) => {
  let newTransaction = req.body;
  Transactions.insert(newTransaction, (err: any, transaction: any) => {
    if (err) res.status(500).send(err);
    else {
      res.sendStatus(200);
      Inventory.decrementInventory(transaction.products);
    }
  });
});

router.get("/:transactionId", (req: Request, res: Response) => {
  Transactions.find({ _id: req.params.transactionId }, (err: any, doc: any) => {
    if (doc) res.send(doc[0]);
  });
});

export default router;