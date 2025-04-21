import { Request, Response, Router } from "express";
import productService from '../services/productService';

const router = Router();

router.post('/products', (req: Request, res: Response) => {
    productService.insert(req.body).then(() => res.status(200).send(`added ${req.body.dept_name} to the table!`))
});

router.put('/products/:id', ({ params: { id }, body }: Request, res: Response) => {
    productService.update(id, body).then(data => res.status(200).json(data))
});

router.get('/products/:id', ({ params: { id } }: Request, res: Response) =>
    productService.find(id).then(data => res.status(200).json(data))
);

router.delete('/products/:id', ({ params: { id } }: Request, res: Response) => {
    productService.destroy(id).then(data => res.status(200).json(data))
});

router.get('/products', (req: Request, res: Response) => {
    productService.list().then(data => res.status(200).json({ data }))
});

router.get('/products/product_type/:product_type_id', ({params:{product_type_id}}: Request, res: Response) => {
    productService.listProductType(product_type_id).then(data => res.status(200).json({ data }))
});

router.get('/products/sale/:sale_id', ({params:{sale_id}}: Request, res: Response) => {
    productService.listSale(sale_id).then(data => res.status(200).json({ data }))
});

export default router;