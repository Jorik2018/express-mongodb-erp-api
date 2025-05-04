import { Request, Response} from 'express'
import { sendError } from '../utils/responses';
const Employee = require("../database/models/employee");
const _ = require('lodash');

const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await Employee.find({}).populate('office');
    res.send(employees)
  } catch (err:any) {
    res.send({
      err,
    })
  }
}

const getEmployeeById = (req: Request, res: Response) => {
  Employee.find({
    _id: req.params.id
  })
    .populate('office')
    .then((task: any) => res.send(task))
    .catch(sendError(res));
};

const addEmployee =  (req: Request, res: Response) => {
  new Employee(req.body)
    .saveAndPopulate()
    .then((employee: any) => res.send(employee))
    .catch(sendError(res));
};

const updateEmployee = (req: Request, res: Response) => {
  Employee.findOneAndUpdate(
    {
      _id: req.body._id
    },
    { $set: req.body},
    {
      new: true,
    }
  ).populate('office')
    .exec((err: Error, employee: any) => {
      if (!err) {
        res.send(employee);
      } else {
        res.send(err)
      }
    });
};

const deleteEmployee = (req: Request, res: Response) => {
  Employee.findOneAndDelete({
    _id: req.params.id
  })
    .then((task: any) => res.send(task))
    .catch(sendError(res));
};

module.exports = {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  addEmployee,
  deleteEmployee
}
