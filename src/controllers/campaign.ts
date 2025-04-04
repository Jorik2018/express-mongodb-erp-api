import { Request, Response } from 'express';
import Campaign, { ICampaign } from '../database/models/campaign';
import { Types } from 'mongoose';
interface RequestWithUserId extends Request {
  userId: string;
}

const list = async (req: Request, res: Response) => {
  try {
    const campaign = (await Campaign.find({}).populate('sponsor')).map(({ _doc: doc }: any) => ({
      ...doc,
      id: doc._id,
      _id: undefined, // Optionally remove _id
    }));
    res.send({ data: campaign })
  } catch (err: any) {
    res.send({
      err,
    })
  }
}

const find = (req: Request, res: Response) => {
  Campaign.findOne({
    _id: req.params.id
  }).populate('sponsor')
    .then(({ _doc: { _id, categories, category, gallery, image, ...campaign } }: any) => res.send({
      id: _id,
      categories: categories && categories.length ? categories : [category],
      gallery: gallery && gallery.length ? gallery : [image, image, image, image], ...campaign
    }))
    .catch((error: Error) => console.log(error));
};

//Property 'userId' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.ts(2339)
const create = ({ body: { brandId, ...body }, userId }: RequestWithUserId, res: Response) => {
  const user = Types.ObjectId.createFromHexString(userId);
  const brand = Types.ObjectId.createFromHexString(brandId);
  new Campaign({ ...body, user, brand })
    .save()
    .then(({ _doc: { _id, ...campaign } }: any) => res.send({ id: _id, ...campaign }))
    .catch((err: Error) => {
      res.send({
        err,
      })
    });
};

const update = (req: Request, res: Response) => {
  Campaign.findOneAndUpdate(
    {
      _id: req.params.id
    },
    { $set: req.body }
  )
    .then((campaign: any) => res.send(campaign))
    .catch((error: Error) => console.log(error));
};

const remove = (req: Request, res: Response) => {
  Campaign.findOneAndDelete({
    _id: req.params.id
  })
    .then((campaign: any) => res.send(campaign))
    .catch((error: Error) => console.log(error));
};

module.exports = {
  list,
  find,
  update,
  create,
  remove
}
