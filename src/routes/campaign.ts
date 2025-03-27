const { list, find, remove, create, update} = require("../controllers/campaign");
const router = require('express').Router();

router.get('/', list);
router.post('/', create);
router.get('/:id', find);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
