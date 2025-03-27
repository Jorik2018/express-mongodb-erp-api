import { model, Schema } from 'mongoose';

const contactSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    photoUrl: { type: String, required: true },
    rating: { type: Number, required: true },
    categories: { type: [String], required: true },
    videosCount: { type: Number, required: true },
    followersCount: { type: Number, required: true },
    bio: { type: String, required: true },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 12
    },
    imageURL: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
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
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]

});

export default model('influencers', contactSchema);