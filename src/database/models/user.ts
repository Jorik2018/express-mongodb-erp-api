import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends mongoose.Document {
    fullName: string;
    userName: string;
    email: string;
    password: string;
    date: Date;
    loggedOn: boolean;
    verifyPassword(password: string): boolean;
}

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    date:{
        type: Date,
        required: true
    },
    loggedOn:{
        type: Boolean,
        required: true,
        default: false
    }
});

UserSchema.methods.verifyPassword = function (password: string) {
    return bcrypt.compareSync(password, this.password);
};

export default mongoose.model('User2', UserSchema);