import express from 'express';

const {userById, userByToken, getUsers, addUser} = require("../controllers/user");
const router = express.Router();
/*
router.get('/currentUser', userByToken);

router.get("/:userId", userById);

router.get("/", getUsers);

router.post("/add", addUser);
*/
export default router;
