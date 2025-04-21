import { Request, Response, Router } from "express";
import departmentService from '../services/departmentService';

const router = Router();

router.post('/departments', (req: Request, res: any) => {
    departmentService.insert(req.body).then(() => res.status(200).send(`added ${req.body.dept_name} to the table!`))
});

router.put('/departments/:id', ({ params, body }: Request, res: Response) => {
    departmentService.update(params.id, body).then(data => res.status(200).json(data))
});

router.get('/departments/:id', ({ params }: Request, res: Response) =>
    departmentService.find(params.order_id).then(data => res.status(200).json(data))
);

router.delete('/departments/:id', ({ params }: Request, res: Response) => {
    departmentService.destroy(params.order_id).then(data => res.status(200).json(data))
});

router.get('/departments', (req: any, res: Response) => {
    departmentService.list().then(data => res.status(200).json({ data }))
});

export default router;