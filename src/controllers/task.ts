import { Request, Response } from 'express';
import Task, { ITask } from '../database/models/task';
import { sendError } from '../utils/errors';

const list = (req: Request, res: Response) => {
  Task.find({}).then((tasks) => res.send({ data: tasks })).catch(sendError(res))
}

const find = (req: Request, res: Response) => {
  Task.findOne({
    _id: req.params.id
  })
    .then((task: any) => res.send(task))
    .catch(sendError(res));
};

const create = (req: Request, res: Response) => {
  new Task(req.body)
    .save()
    .then((task: ITask) => res.send(task))
    .catch(sendError(res));
};

const update = (req: Request, res: Response) => {
  Task.findOneAndUpdate(
    {
      _id: req.params.id
    },
    { $set: req.body }
  )
    .then((Task: any) => res.send(Task))
    .catch(sendError(res));
};

const deleteOffice = (req: Request, res: Response) => {
  Task.findOneAndDelete({
    _id: req.params.id
  })
    .then((Task: any) => res.send(Task))
    .catch(sendError(res));
};

module.exports = {
  list,
  find,
  update,
  create,
  deleteOffice
}
