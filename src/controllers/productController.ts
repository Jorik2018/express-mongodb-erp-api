
import { Router, Response, Request } from 'express';
import { sendError, sendJson } from '../utils/responses';
import productService from '../services/productService';

const router = Router();

router.get("/product/:id", ({ params: { id } }: Request, res: Response) =>
    productService.find(id).then(sendJson(res)).catch(sendError(res))
);

router.get("/products", ({ query }: Request, res: Response) => {
    productService.list(query).then(sendJson(res)).catch(sendError(res));
});

router.post("/product", (req: Request, res: Response) => {
    let newProduct = req.body;
    inventoryDB.insertAsync(newProduct).then((product: any) => {
        res.send(product);
    }).catch(sendError(res));
});

router.delete("/product/:id", ({ params: { id } }: Request, res: Response) => {
    inventoryDB.removeAsync({
        _id: id
    }, {}).then(sendJson(res)).catch(sendError(res));
});

router.put("/product", ({ body }: Request, res: Response) => {
    let { id, ...product } = body;
    inventoryDB.updateAsync({ _id: id }, product, {}).then(sendJson(res)).catch(sendError(res));;
});

(router as any).decrementInventory = (products: any) => {
    async.eachSeries(products, (transactionProduct: any, callback: any) => {
        inventoryDB.findOneAsync({
            _id: transactionProduct._id
        }).then((product: any) => {
            if (!product || !product.quantity_on_hand) {
                callback();
            } else {
                let updatedQuantity =
                    parseInt(product.quantity_on_hand) -
                    parseInt(transactionProduct.quantity);
                inventoryDB.updateAsync({
                    _id: product._id
                }, {
                    $set: {
                        quantity_on_hand: updatedQuantity
                    }
                }).then(callback);
            }
        });
    });
};

export default router;