import { Router } from 'express';

const {userById, userByToken, getUsers, addUser,update} = require("../controllers/user");
const router = Router();

//router.get('/currentUser', userByToken);

router.get("/:id", userById);
router.get("/", getUsers);
router.post("/", addUser);
router.put("/", update);
export default router;
