import { Request, Response, Router } from "express";
import orderService from '../services/orderService';

const router = Router();

router.post('/orders', (req: Request, res: any) => {
    orderService.insert(req.body).then(data => res.status(200).json(data))
});

router.put('/orders/:id', ({ params, body }: Request, res: Response) => {
    orderService.update(params.id, body).then(data => res.status(200).json(data))
});

router.get('/orders/:id', ({ params }: Request, res: Response) =>
    orderService.find(params.order_id).then(data => res.status(200).json(data))
);

router.delete('/orders/:order_id', (req: any, res: Response) => {
    orderService.destroy(req.params.order_id).then(data => res.status(200).json(data))
});

router.get('/orders', (req: any, res: Response) => {
    orderService.list().then(data => res.status(200).json({ data }))
});

export default router;