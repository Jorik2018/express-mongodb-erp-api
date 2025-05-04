import { Request, Response, Router } from "express";
import saleService from '../services/saleService';
import { sendJson } from "../../utils/responses";

const router = Router();

router.post('/sales', (req: Request, res: any) => {
    saleService.insert(req.body).then(sendJson(res))
});

router.put('/sales/:id', ({ params: { id }, body }: Request, res: Response) => {
    saleService.update(id, body).then(sendJson(res))
});

router.get('/sales/:id', ({ params: { id } }: Request, res: Response) =>
    saleService.find(id).then(sendJson(res))
);

router.delete('/sales/:id', ({ params: { id } }: Request, res: Response) => {
    saleService.destroy(id).then(sendJson(res))
});

router.get('/sales', (req: any, res: Response) => {
    saleService.list().then(data => sendJson(res)({ data }))
});

export default router;