import { Router } from 'express';

const { getEmployees, getEmployeeById, addEmployee, updateEmployee, deleteEmployee } = require("../controllers/employee");
const router = Router();

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/add', addEmployee);
router.patch('/update', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
