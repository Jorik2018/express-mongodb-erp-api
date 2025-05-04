import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Brand, { IBrand } from '../database/models/brand';
import { sendError } from '../utils/responses';
import { moveTmp } from './upload';

const list = ({ userId: user, from = 0, to = 10, query }: Request | any, res: Response) => {
  const filter = { user };
  return Brand.find(filter).then((brands) =>
    brands.map((brand) => {
      const { _id, ...data } = brand.toObject();
      return ({
        ...data,
        id: _id
      })
    })
  ).then((brands) => Brand.countDocuments(filter).then((total) => {
    res.send({ data: brands, total })
  })).catch(sendError(res));
}

const find = (req: Request, res: Response) => {
  Brand.findOne({
    _id: req.params.id
  })
    .then((brand: any) => res.send(brand))
    .catch(sendError(res));
};

const create = ({ body: { imageUrl, ...body }, userId }: Request | any, res: Response) => {
  const user = Types.ObjectId.createFromHexString(userId);
  new Brand({ ...body, user })
    .save()
    .then((brand: IBrand) => {
      const { _id, ...data } = brand.toObject();
      console.log('_id==',_id)
      return moveTmp([imageUrl], 'brands').then(([imageUrl]) =>
        Brand.updateOne({ _id },
          { $set: { imageUrl } }).then(() => res.send({ ...data, imageUrl, id: _id }))
      )
    })
    .catch(sendError(res));
};

const update = ({ body: { id, imageUrl, ...body }, userId }: any, res: Response) => {
  Brand.findOne({ _id: id }).lean().then(({ _id, ...brand }: any) => {
    const user = Types.ObjectId.createFromHexString(userId);
    return moveTmp([imageUrl], 'brands').then(([imageUrl]: any) =>
      Brand.updateOne({ _id },
        { $set: { ...body, imageUrl, user } }).then(() => res.send({ ...brand, imageUrl, id: _id }))

    )
  }).catch(sendError(res));
};

const destroy = (req: Request, res: Response) => {
  Brand.findOneAndDelete({
    _id: req.params.id
  }).then(({ _doc: { _id, ...data } }: any) => {
    res.send({
      ...data,
      id: _id
    });
  }).catch(sendError(res));
};

module.exports = {
  list,
  find,
  update,
  create,
  destroy
}
