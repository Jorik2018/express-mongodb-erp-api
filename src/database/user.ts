import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema(
	{
		name: { type: String, trim: true, required: true, min: 3, max: 64 },
		lastname: { type: String, trim: true, required: true, min: 3, max: 64 },
		email: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			lowercase: true,
		},
		password: { type: String, required: true, min: 6, max: 64 },
		picture: {
			type: String,
			default: './avatar.png',
		},
		role: {
			type: [String],
			default: ['Subscriber'],
			enum: ['Subscriber', 'Instructor', 'Admin'],
		},
		confirmed: {
			type: Boolean,
			default: false,
		},
		passwordResetCode: {
			type: String,
			default: '',
		},
		contacts: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Contact'
			}
		]
	},

	{ timestamps: true }
);

export default mongoose.model('User', userSchema);
