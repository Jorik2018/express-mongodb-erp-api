import { Schema, model } from 'mongoose';

const EmployeeSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true
  },
  office: {
    type: Schema.Types.ObjectId,
    ref: 'Office'
  },
  phoneNumber: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  tags: [String]
});

EmployeeSchema.methods.saveAndPopulate = function (cb: any) {
  return this.save().then((doc: any) => doc.populate('office').execPopulate())
}

const EmployeeModel = model('Employee', EmployeeSchema);
module.exports = EmployeeModel;
