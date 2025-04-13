import { Schema, model } from 'mongoose';


const ProfileSchema = new Schema({
	user: {
		type: String,
	},
	displayName: {
		type: String,
	},
	email: {
		type: String,
	},
	avatar: {
		type: String,
	},
	address: {
		type: String,
	},
	bio: {
		type: String,
	},
	birthDate: {
		type: Date,
	},
	gender: {
		type: String,
	},
	membership: {
		type: String,
	},
	social: {
		twitter: {
			type: String,
		},
		facebook: {
			type: String,
		},
		github: {
			type: String,
		},
	},
	courses: {
		wishlist: [],
		enrolled: [],
		active: [],
		complected: [],
	},

	date: {
		type: Date,
		default: Date.now,
	},
});


const Profile = model('Course', ProfileSchema);

export default Profile;
