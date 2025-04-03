import { Request, Response } from 'express';
import Campaign, { ICampaign } from '../database/models/campaign';

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

const create = (req: Request, res: Response) => {
  new Campaign(req.body)
    .save()
    .then((campaign: ICampaign) => res.send(campaign))
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
