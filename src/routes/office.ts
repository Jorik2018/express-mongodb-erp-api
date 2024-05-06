const { getOffices, getOfficeById, deleteOffice, addOffice, updateOffice} = require("../controllers/office");
const router = require('express').Router();

router.get('/', getOffices);
router.get('/:id', getOfficeById);
router.post('/add', addOffice);
router.patch('/update', updateOffice);
router.delete('/delete', deleteOffice)

export default router;
