import { Schema, Document, model } from 'mongoose';

const OfficeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  }
});

const Office = model('Office', OfficeSchema);
export default Office;
