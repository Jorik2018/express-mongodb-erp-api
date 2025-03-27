import { Request, Response} from 'express';
import Task, { ITask } from '../database/models/task';

const list = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({})
    res.send({data:tasks})
  } catch (err) {
    res.send({
      err,
    })
  }
}

const find = (req: Request, res: Response) => {
  Task.findOne({
    _id: req.params.id
  })
    .then((task: any) => res.send(task))
    .catch((error: Error) => console.log(error));
};

const create = (req: Request, res: Response) => {
  new Task(req.body)
    .save()
    .then((task: ITask) => res.send(task))
    .catch((err: Error) => {
      res.send({
        err,
      })
    });
};

const update = (req: Request, res: Response) => {
  Task.findOneAndUpdate(
    {
      _id: req.params.id
    },
    { $set: req.body }
  )
    .then((Task: any) => res.send(Task))
    .catch((error: Error) => console.log(error));
};

const deleteOffice = (req: Request, res: Response) => {
  Task.findOneAndDelete({
    _id: req.params.id
  })
    .then((Task: any) => res.send(Task))
    .catch((error: Error) => console.log(error));
};

module.exports = {
  list,
  find,
  update,
  create,
  deleteOffice
}
