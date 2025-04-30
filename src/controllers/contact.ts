import { Request, Response } from 'express'
import Contact from '../database/models/contact';
import { sendError } from '../utils/errors';
import contactService from '../services/contactService';
import { RequestWithUserId } from '../auth/is-auth';

const find = ({ params: { id }, userId }: RequestWithUserId, res: Response) => {
    contactService.find(id, userId)
        .catch(sendError(res));
};

const list = (req: RequestWithUserId, res: Response) => {
    Contact.find({})
        .then((data: any[]) => {
            res.status(200).send({
                data: data.map(({ _doc: { _id, ...item } }) => ({ id: _id, ...item }))
            })
        }).catch(sendError(res))
};

module.exports = {
    list,
    find
}