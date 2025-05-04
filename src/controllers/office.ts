import { Request, Response} from 'express'
import { sendError } from '../utils/responses';
const Office = require("../database/models/office");

const getOffices = async (req: Request, res: Response) => {
  try {
    const offices = await Office.find({})
    res.send(offices)
  } catch (err:any) {
    res.send({
      err,
    })
  }
}

const getOfficeById = (req: Request, res: Response) => {
  Office.find({
    _id: req.params.id
  })
    .then((task: any) => res.send(task))
    .catch(sendError(res));
};

const addOffice = (req: Request, res: Response) => {
  new Office({
    name: req.body.name,
    location: req.body.location
  })
    .save()
    .then((office: any) => res.send(office))
    .catch((err: Error) => {
      res.send({
        err,
      })
    });
};

const updateOffice = (req: Request, res: Response) => {
  Office.findOneAndUpdate(
    {
      _id: req.params.id
    },
    { $set: req.body }
  )
    .then((office: any) => res.send(office))
    .catch(sendError(res));
};

const deleteOffice = (req: Request, res: Response) => {
  Office.findOneAndDelete({
    _id: req.params.id
  })
    .then((office: any) => res.send(office))
    .catch(sendError(res));
};

module.exports = {
  getOffices,
  getOfficeById,
  updateOffice,
  addOffice,
  deleteOffice
}
