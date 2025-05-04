import { Request, Response } from 'express'
import User from '../database/models/user'
import jwt from 'jsonwebtoken'
import { sendError } from '../utils/responses';
import { RequestWithUserId } from '../auth/is-auth';
import { Types } from 'mongoose';
import Contact from '../database/models/contact';
import { moveTmp } from './upload';

const userByToken = (req: Request, res: Response) => {
  const decoded: any = jwt.verify(
    req.headers["authorization"]!,
    process.env.SECRET_KEY!
  );

  User.findOne({
    _id: decoded._id
  }).then((user) => {
    if (user) {
      res.json(user);
    } else {
      res.send("Index does not exist");
    }
  }).catch(sendError(res));
};

const userById = (req: Request, res: Response) => {
  User.findOne({ _id: req.params.id }).then((user) => res.send(user))
    .catch(sendError(res));
};

const getUsers = (req: Request, res: Response) => {
  User.find({})
    .then((user: any) => res.send(user))
    .catch(sendError(res));
};

const addUser = (req: Request, res: Response) => {
  new User({
    fullName: req.body.fullName,
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password
  })
    .save()
    .then((user: any) => res.send(user))
    .catch((error: any) => console.log(error));
};


const update = ({ body: { id, profileImage, socials, bio, ...body }, userId }: RequestWithUserId, res: Response) => {
  //el userId pertenece a un admin es posible editar cualquier id en caso contrario debe actualizar el propio
  id = id || userId;
  User.findOne({
    _id: id
  }).lean().then(({ _id: user }: any) => Contact.findOne({
    user: user.toHexString()
  }).lean().then((contact) => moveTmp([profileImage], 'profiles').then(([profileImage]) => {
    if (contact) {
      const { _id } = contact;
      return Contact.updateOne({ _id }, { $set: { bio, profileImage } }, { new: true })
        .then(() => ({ ...body, profileImage, bio }))
    } else {
      return new Contact({ bio, profileImage, user: Types.ObjectId.createFromHexString(userId), ...body }).save()
        .then(({ _doc: { _id, ...others } }: any) => (others))
    }
  }))).then(({ _id, ...data }: any) => {
    res.send({ ...data });
  }).catch(sendError(res));
};

module.exports = {
  update,
  userById,
  userByToken,
  getUsers,
  addUser
}
