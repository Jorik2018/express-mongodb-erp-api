import { Schema, Document, model } from 'mongoose';

export interface Item extends Document {
  name: string;
  description: string;
}

const ItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true }
});

export default model<Item>('Item', ItemSchema);
