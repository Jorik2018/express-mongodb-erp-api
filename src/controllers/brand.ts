import { Request, Response } from 'express';
import Brand, { IBrand } from '../database/models/brand';

const list = async (req: Request, res: Response) => {
  try {
    const tasks = await Brand.find({})
    res.send({ data: tasks })
  } catch (err: any) {
    res.send({
      err,
    })
  }
}

const find = (req: Request, res: Response) => {
  Brand.findOne({
    _id: req.params.id
  })
    .then((brand: any) => res.send(brand))
    .catch((error: Error) => console.log(error));
};

const create = (req: Request|any, res: Response) => {
  console.log('req.userId=',req.userId)
  new Brand(req.body)
    .save()
    .then((brand: IBrand) => res.send(brand))
    .catch((err: Error) => {
      res.send({
        err,
      })
    });
};

const update = (req: Request, res: Response) => {
  Brand.findOneAndUpdate(
    {
      _id: req.params.id
    },
    { $set: req.body }
  )
    .then((Brand: any) => res.send(Brand))
    .catch((error: Error) => console.log(error));
};

const deleteOffice = (req: Request, res: Response) => {
  Brand.findOneAndDelete({
    _id: req.params.id
  })
    .then((Brand: any) => res.send(Brand))
    .catch((error: Error) => console.log(error));
};

module.exports = {
  list,
  find,
  update,
  create,
  deleteOffice
}
