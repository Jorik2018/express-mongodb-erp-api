import { InferSchemaType, Model, model, Schema } from 'mongoose';

const socialMediaSchema = new Schema({
    id: String,
    access_token: String,
    refresh_token: String,
    expires_in: Number,
    refresh_expire_in: Number,
    name: String,
    followers: Number,
    medias: Number,
    updateAt: Date
});

const contactSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    profileImage: { type: String },
    rating: { type: Number },
    categories: { type: [String], required: true },
    videosCount: { type: Number },
    followers: { type: Number },
    bio: { type: String },
    email: {
        type: String
    },
    contacts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Contact'
        }
    ],
    phone: {
        type: String,
        minlength: 8,
        maxlength: 12
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

export type IContact = InferSchemaType<typeof contactSchema>;

const Contact: Model<IContact> = model<IContact>('Contact', contactSchema);

export default Contact;