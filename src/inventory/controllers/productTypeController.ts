import { Request, Response, Router } from "express";
import productTypeService from '../services/productTypeService';

const router = Router();

router.post('/product_types', ({ body }: Request, res: Response) => {
    productTypeService.insert(body).then(() => res.status(200).send(`added ${body.product_type_name} to the table!`))
});

router.put('/product_types/:id', ({ params: { id }, body }: Request, res: Response) => {
    productTypeService.update(id, body).then(data => res.status(200).json(data))
});

router.get('/product_types/:id', ({ params: { id } }: Request, res: Response) =>
    productTypeService.find(id).then(data => res.status(200).json(data))
);

router.delete('/product_types/:id', ({ params: { id } }: Request, res: Response) => {
    productTypeService.destroy(id).then(data => res.status(200).json(data))
});

router.get('/product_types', (req: Request, res: Response) => {
    productTypeService.list().then(data => res.status(200).json({ data }))
});

router.get('/product_types/name/:product_type_name', ({ params: { product_type_name } }: Request, res: Response) => {
    productTypeService.listByName(product_type_name).then(data => res.status(200).json({ data }))
});

router.get('/product_types/department/:dept_id', ({ params: { dept_id } }: Request, res: Response) => {
    productTypeService.listByDepartment(dept_id).then(data => res.status(200).json({ data }))
});

router.get('/product_types/:product_type_id/quantity', ({ params: { product_type_id } }: Request, res: Response) => {
    productTypeService.listByDepartment(product_type_id).then(data => res.status(200).json({ data }))
});

export default router;