import { NextFunction, Request, Response } from 'express'
import Contact from '../database/models/contact';

const find = (req: Request, res: Response) => {
    Contact.findOne({
      _id: req.params.id
    })
      .then(({_doc:contact}: any) => res.send({rating:0,followersCount:0,...contact}))
      .catch((error: Error) => console.log(error));
  };

  
const list = (req: Request, res: Response, next: NextFunction) => {
    Contact.find({})
        .then((data:any[]) => {
            res.status(200).send({
                data:data.map(({_doc:{_id,...item}})=>({id:_id,...item}))
            })
        }).catch((err:any) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
};

module.exports = {
    list,
    find
}