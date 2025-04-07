import { Request, Response } from 'express'
import Contact from '../database/models/contact';
import { sendError } from '../utils/errors';

const find = (req: Request, res: Response) => {
    Contact.findOne({
        _id: req.params.id
    })
        .then(({ _doc: contact }: any) => res.send({ rating: 0, followersCount: 0, ...contact }))
        .catch(sendError(res));
};


const list = (req: Request, res: Response) => {
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