import { Request, Response } from 'express'
import { IUser } from '../database/models/user'
const jwt = require("jsonwebtoken");
const User = require("../database/models/user");


const userByToken = (req: Request, res: Response) => {
  const decoded = jwt.verify(
    req.headers["authorization"],
    process.env.SECRET_KEY
  );

  User.findOne({
    _id: decoded._id
  }).then((user: IUser) => {
      if (user) {
        res.json(user);
      } else {
        res.send("Index does not exist");
      }
    })
    .catch((err: Error) => {
      res.send(err);
    });
};

const userById = (req: Request, res: Response) => {
  User.find({
    _id: req.params.userId
  }).then((user: IUser) => res.send(user))
    .catch((err: Error) => {
      res.send({
        err
      });
    });
};

const getUsers = (req: Request, res: Response) => {
  User.find({})
    .then((user: any) => res.send(user))
    .catch((error: Error) => console.log(error));
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

module.exports = {
  userById,
  userByToken,
  getUsers,
  addUser
}
