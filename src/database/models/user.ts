import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
	date: Date;
	loggedOn: boolean;
	verifyPassword(password: string): boolean;
}

const UserSchema = new Schema(
	{
		address: { type: String, required: true },
		followers: { type: Number},
		profileImage: { type: String, default: '' },
		preferences: { type: [String]},
		isAdvertiser: { type: Boolean, default: false },

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
		],


		uid: {
			type: String,
		},
		displayName: {
			type: String,
		},
		avatar: {
			type: String,
		},
		membership: {
			type: String,
	
		},
		date: {
			type: Date,
			default: Date.now,
		},
	},

	{ timestamps: true }
);

UserSchema.methods.verifyPassword = function (password: string) {
	return bcrypt.compareSync(password, this.password);
};

export default mongoose.model('User', UserSchema);
