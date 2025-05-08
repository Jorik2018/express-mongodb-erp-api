import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Application, { IApplication } from '../database/models/application';
import Contact from '../database/models/contact';
import User from '../database/models/user';
import { sendError, sendJson } from '../utils/responses';


const list = ({ userId: user, from = 0, to = 10, query: { campaign, contact } }: Request | any, res: Response) => {
  if (contact) {
    contact = Types.ObjectId.createFromHexString(contact);
    const filter = { contact };
    Application.find(filter).populate({
      path: 'campaign',
      populate: {
        path: 'brand' // Asegúrate de que 'brand' es el nombre correcto del campo en tu esquema
      }
    }).then((data: any) => {
      res.send({
        data: data.map(({ _doc: { campaign: { _doc: { _id, ...campaign } }, ...others } }: any) => ({
          ...others,
          campaign: { id: _id, ...campaign }
        }))
      })
    }).catch(sendError(res))
  } else {
    campaign = Types.ObjectId.createFromHexString(campaign);
    const filter = { campaign };
    Application.find(filter).populate('contact').lean().then((contacts) => {
      res.send({
        data: contacts.filter(({ contact }) => contact).map(({ _id: application, contact: { _id: id, ...contact }, ...others }: any) => ({
          ...others,
          id: application,
          contact: { id, ...contact }
        }))
      })
    }).catch(sendError(res))
  }
}

const find = (_id: string, userId: string) => {
  return Application.findOne({
    _id
  }).populate('contact').lean()
    .then(({ contact, ...application }: any) => {
      const socials = Object.entries(contact?.socials || {}).map(([key, { name, medias, followers }]: any) => ({
        key,
        name
      }));
      return { ...application, socials, status: 'pending' }
    })
};

const create = ({ body, userId }: Request | any, res: Response) => {
  console.log(body);
  const user = Types.ObjectId.createFromHexString(userId);
  const campaign = Types.ObjectId.createFromHexString(body.campaign);
  const applyToCampaign = (contact: any) => {
    return new Application({ campaign, contact: contact._id })
      .save()
      .then((brand) => {
        const { _id, ...data } = brand.toObject();
        res.send({
          ...data,
          id: _id
        });
      })
      .catch(sendError(res));
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
  }).catch(sendError(res));
};

const destroy = (req: Request, res: Response) => {
  Application.findOneAndDelete({
    _id: req.params.id
  }).then(({ _doc: { _id, ...data } }: any) => {
    res.send({
      ...data,
      id: _id
    });
  }).catch(sendError(res));
};

export default {
  list,
  find,
  update,
  create,
  destroy
}
