import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Application, { IApplication } from '../database/models/application';
import Contact from '../database/models/contact';
import User from '../database/models/user';

const list = ({ userId: user, from = 0, to = 10, query }: Request | any, res: Response) => {
  const campaign = Types.ObjectId.createFromHexString(query.campaign);
  const filter = { campaign };
  Application.find(filter).populate('contact').then((data: any) => {
    
    res.send({data:data.map(({_doc:{ contact: {_doc:{ _id, ...contact }}, ...others }}:any)=>({
      ...others,
      contact: { id: _id, ...contact }
    }))})
  }).catch((err) => {
    res.send({
      err
    })
  })
}

const find = (req: Request, res: Response) => {
  Application.findOne({
    _id: req.params.id
  })
    .then((brand: any) => res.send(brand))
    .catch((error: Error) => console.log(error));
};

const create = ({ body, userId }: Request | any, res: Response) => {
  console.log(body);
  const user = Types.ObjectId.createFromHexString(userId);
  const campaign = Types.ObjectId.createFromHexString(body.campaign);
  const applyToCampaign = (contact: any) => {
    console.log('contact=', contact);
    return new Application({ campaign, contact: contact._id })
      .save()
      .then((brand: IApplication) => {
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
  }
  Contact.findOne({ user }).then((contact) => {
    if (!contact) {
      return User.findOne({ _id: user }).then((user: any) => {
        contact = new Contact({
          name: user.name,
          categories: [],
          user, // Asegúrate de que `user` sea un array como en el esquema
        });
        return contact.save().then((contact) => applyToCampaign(contact));
      })
    } else {
      return applyToCampaign(contact);
    }
  })
};

const update = ({ body: { id, ...body } }: Request, res: Response) => {
  Application.findOneAndUpdate(
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
  Application.findOneAndDelete({
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
