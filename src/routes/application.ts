import { Router } from 'express';

const { list, find, create, update, destroy } = require("../controllers/application");
const router = Router();

router.get('/', list);
router.post('/', create);
router.get('/:id', find);
router.put('/', update);
router.delete('/:id', destroy);

export default router;
