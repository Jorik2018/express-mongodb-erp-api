import { Router } from 'express';

const { list, find, deleteOffice, create, update} = require("../controllers/task");
const router = Router();

router.get('/', list);
router.post('/', create);
router.get('/:id', find);
router.patch('/:id', update);

export default router;
