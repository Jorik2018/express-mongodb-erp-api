import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Application, { IApplication } from '../database/models/application';
import applicationService from '../services/applicationService';
import Contact from '../database/models/contact';
import User from '../database/models/user';
import { sendError, sendJson } from '../utils/responses';
import { RequestWithUserId } from '../auth/is-auth';


const list = ({ userId: user, from = 0, to = 10, query: { campaign, contact } }: Request | any, res: Response) => {
  if (contact) {
    contact = Types.ObjectId.createFromHexString(contact);
    const filter = { contact };
    Application.find(filter).populate({
      path: 'campaign',
      populate: {
        path: 'brand' // Asegúrate de que 'brand' es el nombre correcto del campo en tu esquema
      }
    }).then((data: any) => {
      res.send({
        data: data.map(({ _doc: { campaign: { _doc: { _id, ...campaign } }, ...others } }: any) => ({
          ...others,
          campaign: { id: _id, ...campaign }
        }))
      })
    }).catch(sendError(res))
  } else {
    campaign = Types.ObjectId.createFromHexString(campaign);
    const filter = { campaign };
    Application.find(filter).populate('contact').lean().then((contacts) => {
      res.send({
        data: contacts.filter(({ contact }) => contact).map(({ _id: application, contact: { _id: id, ...contact }, ...others }: any) => ({
          ...others,
          id: application,
          contact: { id, ...contact }
        }))
      })
    }).catch(sendError(res))
  }
}

const find = ({ params, userId }: RequestWithUserId, res: Response) => {
  applicationService.find(params.id, userId)
    .then(sendJson(res))
    .catch(sendError(res));
};

const create = ({ body, userId }: RequestWithUserId, res: Response) => {
  applicationService.create(body, userId)
    .then(sendJson(res))
    .catch(sendError(res));
};

const update = ({ body, userId }: RequestWithUserId, res: Response) => {
  applicationService.update(body, userId)
    .then(sendJson(res))
    .catch(sendError(res));
};

const destroy = (req: Request, res: Response) => {
  Application.findOneAndDelete({
    _id: req.params.id
  }).then(({ _doc: { _id, ...data } }: any) => {
    res.send({
      ...data,
      id: _id
    });
  }).catch(sendError(res));
};

export default {
  list,
  find,
  update,
  create,
  destroy
}
