import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Brand, { IBrand } from '../database/models/brand';

const list = async ({ userId: user, from = 0, to = 10, query }: Request | any, res: Response) => {
  try {
    const filter = { user };
    console.log('query=', query)
    const brands = await Brand.find(filter)
    const transformedBrands = brands.map((brand) => {
      const { _id, ...data } = brand.toObject();
      return ({
        ...data,
        id: _id
      })
    });
    const total = await Brand.countDocuments(filter);
    res.send({ data: transformedBrands, total })
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

const create = ({ body, userId }: Request | any, res: Response) => {
  const user = Types.ObjectId.createFromHexString(userId);
  new Brand({ ...body, user })
    .save()
    .then((brand: IBrand) => {
      const { _id, ...data } = brand.toObject();
      res.send({
        ...data,
        id: _id
      });
    })
    .catch((err: Error) => {
      res.send({
        err,
      })
    });
};

const update = ({ body: { id, ...body } }: Request, res: Response) => {
  Brand.findOneAndUpdate(
    { _id: id },
    { $set: body },
    { new: true }
  ).then(({ _doc: { _id, ...data } }: any) => {
    res.send({
      ...data,
      id: _id
    });
  }).catch((error: Error) => console.log(error));
};

const destroy = (req: Request, res: Response) => {
  Brand.findOneAndDelete({
    _id: req.params.id
  }).then(({ _doc: { _id, ...data } }: any) => {
    res.send({
      ...data,
      id: _id
    });
  }).catch((error: Error) => console.log(error));
};

module.exports = {
  list,
  find,
  update,
  create,
  destroy
}
