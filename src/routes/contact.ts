import { Router } from 'express';

const { list, find } = require("../controllers/contact");
const router = Router();

//router.get('/currentUser', userByToken);
router.get("/:id", find);
router.get("/", list);
export default router;
