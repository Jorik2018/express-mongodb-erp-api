import { Request, Response} from 'express'
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
    .catch((error: Error) => console.log(error));
};

const addEmployee =  (req: Request, res: Response) => {
  new Employee(req.body)
    .saveAndPopulate()
    .then((employee: any) => res.send(employee))
    .catch((error: Error) => res.send(error));
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
    .catch((error: Error) => res.send(error));
};

module.exports = {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  addEmployee,
  deleteEmployee
}
