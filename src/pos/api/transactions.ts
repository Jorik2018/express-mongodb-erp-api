
import { Router, Response, NextFunction,Request } from 'express';
var app = require("express")();
var server = require("http").Server(app);
var bodyParser = require("body-parser");
var Datastore = require("nedb");

var Inventory = require("./inventory");

app.use(bodyParser.json());

module.exports = app;

// Create Database
var Transactions = new Datastore({
  filename: "./server/databases/transactions.db",
  autoload: true
});

app.get("/", function (req: any, res: any) {
  res.send("Transactions API");
});

// GET all transactions
app.get("/all", function (req: any, res: any) {
  Transactions.find({}, (err: any, docs: any) => {
    res.send(docs);
  });
});

// GET all transactions
app.get("/limit", function (req: any, res: any) {
  var limit = parseInt(req.query.limit, 10);
  if (!limit) limit = 5;

  Transactions.find({})
    .limit(limit)
    .sort({ date: -1 })
    .exec((err: any, docs: any) => {
      res.send(docs);
    });
});

// GET total sales for the current day
app.get("/day-total", function (req: any, res: any) {
  // if date is provided
  if (req.query.date) {
    startDate = new Date(req.query.date);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(req.query.date);
    endDate.setHours(23, 59, 59, 999);
  } else {
    // beginning of current day
    var startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    // end of current day
    var endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
  }

  Transactions.find(
    { date: { $gte: startDate.toJSON(), $lte: endDate.toJSON() } },
    function (err: any, docs: any) {
      var result: any = {
        date: startDate
      };

      if (docs) {
        var total = docs.reduce((p: any, c: any) => {
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

// GET transactions for a particular date
app.get("/by-date", function (req: any, res: any) {
  var startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  var endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  Transactions.find(
    { date: { $gte: startDate.toJSON(), $lte: endDate.toJSON() } },
    function (err: any, docs: any) {
      if (docs) res.send(docs);
    }
  );
});

// Add new transaction
app.post("/new", function (req: any, res: any) {
  var newTransaction = req.body;

  Transactions.insert(newTransaction, (err: any, transaction: any) => {
    if (err) res.status(500).send(err);
    else {
      res.sendStatus(200);
      Inventory.decrementInventory(transaction.products);
    }
  });
});

// GET a single transaction
app.get("/:transactionId", function (req: Request, res: Response) {
  Transactions.find({ _id: req.params.transactionId }, (err: any, doc: any) => {
    if (doc) res.send(doc[0]);
  });
});
