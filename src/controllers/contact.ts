import { Response, Router } from 'express';
import Contact from '../database/models/contact';
import { sendError, sendJson } from '../utils/responses';
import contactService from '../services/contactService';
import { RequestWithUserId } from '../auth/is-auth';

const find = ({ params: { id }, userId }: RequestWithUserId, res: Response) => {
    contactService.find(id, userId).then(sendJson(res)).catch(sendError(res));
};

const list = ({query}: RequestWithUserId, res: Response) => {
    contactService.list(query).then(sendJson(res)).catch(sendError(res));
};

const router = Router();

router.get("/me", find as any);
router.get("/:id", find as any);
router.get("/", list as any);

export default router;