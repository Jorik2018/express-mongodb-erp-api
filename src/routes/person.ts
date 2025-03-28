const { list, find, deleteOffice, create, update} = require("../controllers/person");
const router = require('express').Router();

router.get('/', list);
router.post('/', create);
router.get('/:id', find);
router.patch('/:id', update);

export default router;
