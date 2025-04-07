import { Request, Response } from 'express'
import User from '../database/models/user'
import jwt from 'jsonwebtoken'
import { sendError } from '../utils/errors';

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

const update = ({ body: { id, ...body } }: Request, res: Response) => {
  User.findOne({
    _id: id
  }).then((data: any) => {
    const { _doc: { _id, ...others } } = data;
    const updatedValue = { ...others, ...body };
    return User.findOneAndUpdate({ _id }, updatedValue, { new: true });
  }).then(({ _doc: { _id, ...data } }: any) => {
    res.send({ id: _id, ...data });
  }).catch(sendError(res));
};

module.exports = {
  update,
  userById,
  userByToken,
  getUsers,
  addUser
}
