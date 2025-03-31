import { Router } from 'express';

const { list, find, create, update} = require("../controllers/brand");
const router = Router();

router.get('/', list);
router.post('/', create);
router.get('/:id', find);
router.patch('/:id', update);

export default router;
