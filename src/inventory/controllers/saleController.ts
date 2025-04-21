import { Request, Response, Router } from "express";
import saleService from '../services/saleService';

const router = Router();

router.post('/sales', (req: Request, res: any) => {
    saleService.insert(req.body).then(() => res.status(200).send(`added ${req.body.dept_name} to the table!`))
});

router.put('/sales/:id', ({ params: { id }, body }: Request, res: Response) => {
    saleService.update(id, body).then(data => res.status(200).json(data))
});

router.get('/sales/:id', ({ params: { id } }: Request, res: Response) =>
    saleService.find(id).then(data => res.status(200).json(data))
);

router.delete('/sales/:id', ({ params: { id } }: Request, res: Response) => {
    saleService.destroy(id).then(data => res.status(200).json(data))
});

router.get('/sales', (req: any, res: Response) => {
    saleService.list().then(data => res.status(200).json({ data }))
});

export default router;