import { Request, Response, Router } from 'express';
import captaignService from '../services/captaignService';
import { sendError } from '../utils/errors';
import { RequestWithUserId } from '../auth/is-auth';

const list = ({ query, userId }: RequestWithUserId, res: Response) => {
  captaignService.list({ userId, ...query })
    .then(campaigns => res.send({ data: campaigns }))
    .catch(sendError(res))
}

const find = (req: Request, res: Response) => {
  captaignService.find(req.params.id)
    .then(campaign => res.send(campaign))
    .catch(sendError(res));
};

const create = ({ body: { id, brandId, ...body }, userId }: RequestWithUserId, res: Response) => {
  if (id) {
    captaignService.update(id, { ...body, userId, brandId })
      .then((campaign) => res.send(campaign))
      .catch(sendError(res));
  } else
    captaignService.create({ ...body, userId, brandId })
      .then(campaign => res.send(campaign))
      .catch(sendError(res));
};

const update = (req: Request, res: Response) => {
  captaignService.update(req.params.id, req.body)
    .then((campaign) => res.send(campaign))
    .catch(sendError(res));
};

const activate = (req: Request, res: Response) => {
  captaignService.activate(req.params.id)
    .then((campaign) => res.send(campaign))
    .catch(sendError(res));
};

const remove = (req: Request, res: Response) => {
  captaignService.remove(req.params.id)
    .then((campaign) => res.send(campaign))
    .catch(sendError(res));
};

const router = Router();

router.get('/', list as any);
router.post('/', create as any);
router.get('/:id', find);
router.patch('/:id', update);
router.patch('/activate/:id', activate);
router.delete('/:id', remove);
export default router;
