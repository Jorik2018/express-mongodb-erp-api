import { Schema, Document, Model, model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
	loggedOn: boolean;
	verifyPassword(password: string): boolean;
	roles: [String];
	password: string;
}

const UserSchema: Schema = new Schema(
	{
		followers: { type: Number },
		profileImage: { type: String, default: '' },
		preferences: { type: [String] },

		name: { type: String, trim: true, required: true, min: 3, max: 64 },
		lastname: { type: String, trim: true, min: 3, max: 64 },
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
		roles: {
			type: [String],
			default: ['Subscriber'],
			enum: ['Subscriber', 'Instructor', 'Admin', 'Sponsor'],
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
		displayName: {
			type: String,
		},
		avatar: {
			type: String,
		},
		membership: {
			type: String,

		},
		updateDate: { type: Date },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

UserSchema.pre('save', function (next) {
	if (this.isModified()) {
		this.updateDate = new Date();
	}
	next();
});

UserSchema.methods.verifyPassword = function (password: string) {
	return bcrypt.compareSync(password, this.password);
};


const User: Model<IUser> = model<IUser>('User', UserSchema);

export default User;
