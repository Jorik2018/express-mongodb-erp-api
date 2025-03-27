import { Request, Response } from 'express'
import Room, { IRoom } from '../database/models/room';

const list = async (req: Request, res: Response) => {
  Room.find()
    .then((rooms: IRoom[]) => res.send(rooms))
    .catch((error: Error) => console.log(error));
}

const find = (req: Request, res: Response) => {
  Room.findOne({
    _id: req.params.id
  })
    .then((room: any) => res.send(room))
    .catch((error: Error) => console.log(error));
};

const create = (req: Request, res: Response) => {
  console.log(req.body);
  new Room({
    name: req.body.name,
    description: req.body.description,
    userId: req.body.userId,
  })
    .save()
    .then((room: IRoom) => res.send(room))
    .catch((error: Error) => {
      res.send({ error })
    });
};

const update = (req: Request, res: Response) => {
  Room.findOneAndUpdate(
    {
      _id: req.params.id
    },
    { $set: req.body }
  )
    .then((office: any) => res.send(office))
    .catch((error: Error) => console.log(error));
};

const destroy = (req: Request, res: Response) => {
  Room.findOneAndDelete({
    _id: req.params.id
  })
    .then((office: any) => res.send(office))
    .catch((error: Error) => console.log(error));
};

module.exports = {
  list,
  find,
  update,
  create,
  destroy
}
