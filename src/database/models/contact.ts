import { Model, model, Schema } from 'mongoose';

const contactSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    photoUrl: { type: String },
    rating: { type: Number },
    categories: { type: [String], required: true },
    videosCount: { type: Number },
    followersCount: { type: Number },
    bio: { type: String },
    email: {
        type: String
    },
    phone: {
        type: String,
        minlength: 8,
        maxlength: 12
    },
    imageURL: {
        type: String
    },
    location: {
        type: String
    },
    address: { type: String },
    website: {
        type: String
    },
    social: {
        youtube: {
            type: String
        },
        twitter: {
            type: String
        },
        facebook: {
            type: String
        },
        linkedin: {
            type: String
        },
        instagram: {
            type: String
        }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

});

const Contact = model('Contact', contactSchema);

export default Contact;