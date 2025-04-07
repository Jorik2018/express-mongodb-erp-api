
import { Router, Response, NextFunction,Request } from 'express';
const app = require("express")();
const server = require("http").Server(app);
const bodyParser = require("body-parser");
const Datastore = require("nedb");
const async = require("async");

app.use(bodyParser.json());

module.exports = app;

// Creates  Database
var inventoryDB = new Datastore({
    filename: "./server/databases/inventory.db",
    autoload: true
});

// GET a product from inventory by _id
app.get("/product/:productId", (req: Request, res: any) => {
    if (!req.params.productId) {
        res.status(500).send("ID field is required.");
    } else {
        inventoryDB.findOne({
            _id: req.params.productId
        }, (err: any, product: any) => {
            res.send(product);
        });
    }
});

// GET all inventory products
app.get("/products", function (req: Request, res: any) {
    inventoryDB.find({}, function (err: any, docs: any) {
        console.log("sending inventory products");
        res.send(docs);
    });
});

// post inventory product
app.post("/product", function (req: Request, res: any) {
    var newProduct = req.body;

    inventoryDB.insert(newProduct, (err: any, product: any) => {
        if (err) res.status(500).send(err);
        else res.send(product);
    });
});

//delete product using product id
app.delete("/product/:productId", function (req: Request, res: any) {
    inventoryDB.remove({
        _id: req.params.productId
    }, function (err: any, numRemoved: any) {
        if (err) res.status(500).send(err);
        else res.sendStatus(200);
    });
});

// Updates inventory product
app.put("/product", (req: Request, res: any) => {
    var productId = req.body._id;

    inventoryDB.update({
        _id: productId
    }, req.body, {}, function (
        err: any,
        numReplaced: any,
        product: any
    ) {
        if (err) res.status(500).send(err);
        else res.sendStatus(200);
    });
});

app.decrementInventory = function (products: any) {
    async.eachSeries(products, (transactionProduct: any, callback: any) => {
        inventoryDB.findOne({
            _id: transactionProduct._id
        }, (
            err: any,
            product: any
        ) => {
            // catch manually added items (don't exist in inventory)
            if (!product || !product.quantity_on_hand) {
                callback();
            } else {
                var updatedQuantity =
                    parseInt(product.quantity_on_hand) -
                    parseInt(transactionProduct.quantity);

                inventoryDB.update({
                    _id: product._id
                }, {
                    $set: {
                        quantity_on_hand: updatedQuantity
                    }
                }, {},
                    callback
                );
            }
        });
    });
};