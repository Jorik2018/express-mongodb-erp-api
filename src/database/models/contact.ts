import { Model, model, Schema } from 'mongoose';

const socialMediaSchema = new Schema({
    id: String,
    followers: Number,
    medias: Number,
});

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
    socials: {
        type: Map,
        of: socialMediaSchema
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

});

const Contact = model('Contact', contactSchema);

export default Contact;