import { Request, Response } from 'express'
import Room, { IRoom } from '../database/models/room';
import { Person, db } from '../database/objection_db';
import { sendError } from '../utils/responses';

const list = (_: Request, res: Response) => {
  db().then(() => Person.query()
    .orderBy('id')
    .then((persons: Person[]) => res.send({ data: persons }))
  ).catch(sendError(res));
}

const find = (req: Request, res: Response) => {
  db().then(() => Person.query()
    .findById(req.params.id)
    .withGraphFetched('children')
    .then((person: Person) => res.send(person))
  ).catch(sendError(res));
};

const create = (req: Request, res: Response) => {
  db().then(() => {
    Person.query().insertGraph(req.body)
      .then((person: Person) => res.send(person))
      .catch((error: Error) => res.send({ error }))
  })
};

const update = (req: Request, res: Response) => {
  Room.findOneAndUpdate(
    {
      _id: req.params.id
    },
    { $set: req.body }
  )
    .then((office: any) => res.send(office))
    .catch(sendError(res));
};

const destroy = (req: Request, res: Response) => {
  Room.findOneAndDelete({
    _id: req.params.id
  })
    .then((office: any) => res.send(office))
    .catch(sendError(res));
};

module.exports = {
  list,
  find,
  update,
  create,
  destroy
}
