import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask extends Document {
  description: string;
  completed: boolean;
}

const TaskSchema: Schema = new Schema({
  description: { type: String, required: true },
  completed: { type: Boolean}
});

const Task: Model<ITask> = mongoose.model<ITask>('Task', TaskSchema);

export default Task;

