
import { Router, Response, Request } from 'express';
import { sendError, sendJson } from '../utils/responses';
import productService from '../services/productService';

const router = Router();

router.get("/product/:id", ({ params: { id } }: Request, res: Response) =>
    productService.find(id).then(sendJson(res)).catch(sendError(res))
);

router.get("/products", ({ query }: Request, res: Response) => {
    productService.list(query).then((data) => sendJson(res)({ data })).catch(sendError(res));
});

router.post("/product", ({ body }: Request, res: Response) => {
    productService.create(body).then(sendJson(res)).catch(sendError(res));
});

router.delete("/product/:id", ({ params: { id } }: Request, res: Response) => {
    productService.remove(id).then(sendJson(res)).catch(sendError(res));
});

router.put("/product", ({ body }: Request, res: Response) => {
    productService.update(body).then(sendJson(res)).catch(sendError(res));
});

(router as any).decrementInventory = productService.decrementInventory;

export default router;