
import { Router, Response, Request } from 'express';
import Datastore from '@seald-io/nedb';

const router = Router();

const async = require("async");

let inventoryDB = new Datastore({
    filename: "./server/databases/inventory.db",
    autoload: true
});

router.get("/product/:productId", (req: Request, res: Response) => {
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
router.get("/products", function (req: Request, res: Response) {
    inventoryDB.find({}, (err: any, docs: any) => {
        console.log("sending inventory products");
        res.send(docs);
    });
});

router.post("/product", function (req: Request, res: Response) {
    let newProduct = req.body;

    inventoryDB.insert(newProduct, (err: any, product: any) => {
        if (err) res.status(500).send(err);
        else res.send(product);
    });
});

router.delete("/product/:productId", function (req: Request, res: Response) {
    inventoryDB.remove({
        _id: req.params.productId
    }, function (err: any, numRemoved: any) {
        if (err) res.status(500).send(err);
        else res.sendStatus(200);
    });
});

router.put("/product", (req: Request, res: Response) => {
    let productId = req.body._id;

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

(router as any).decrementInventory = (products: any) => {
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
                let updatedQuantity =
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

export default router;